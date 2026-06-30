"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createRoutePlanAction,
  deleteRoutePlanAction,
} from "@/lib/actions/routes";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createCalendarEventsRepository, type ClientCalendarEvent } from "@/lib/db/calendarEvents";
import { createClientsRepository } from "@/lib/db/clients";
import { createJobsRepository } from "@/lib/db/jobs";
import { createRoutesRepository, type RoutePlan } from "@/lib/db/routes";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  buildJobLogisticsLocations,
  buildClientEventLogisticsLocations,
  buildLogisticsLocations,
  dedupeLogisticsLocations,
  getClientFullAddress,
  getMissingCoordinateClients,
  LogisticsLocation,
} from "./logisticsData";

const LogisticsMap = dynamic(() => import("./LogisticsMap"), {
  ssr: false,
});

const stopFilters = ["Scheduled", "All", "Lead", "Active", "Inactive"];
const maxGoogleMapsUrlLength = 2048;

type RouteApiResponse = {
  data?: {
    orderedStopIds: string[];
    googleMapsUrl?: string;
    routeProvider?: "nearest_neighbor" | "openroute_service" | "google_traffic";
    routePath?: Array<[number, number]>;
    legDurationSeconds?: number[];
    totalDistanceMeters?: number;
    totalDurationSeconds?: number;
    startsAtOrigin?: boolean;
    returnsToOrigin?: boolean;
    legDurationSource?: "provider" | "estimate";
    warning?: string;
  };
  error?: string;
};

type RouteProviderStatus = {
  providers?: {
    google_traffic?: {
      available: boolean;
      enabled: boolean;
      configured: boolean;
      message: string;
    };
  };
};

type RouteOrigin = {
  type: "business" | "current";
  label: string;
  latitude: number;
  longitude: number;
  address?: string;
};

type RouteMode = "road" | "traffic" | "schedule_aware" | "saved";

type WorkspaceSettingsResponse = {
  settings?: {
    workspaceId?: string;
    companyName?: string;
    companyAddress?: string;
    companyCity?: string;
    companyState?: string;
    companyZip?: string;
    businessLatitude?: number;
    businessLongitude?: number;
  } | null;
  error?: string;
};

type CachedWorkspaceSettings = NonNullable<WorkspaceSettingsResponse["settings"]>;

function settingsToRouteOrigin(
  settings: CachedWorkspaceSettings | null | undefined
): RouteOrigin | null {
  if (
    typeof settings?.businessLatitude !== "number" ||
    typeof settings.businessLongitude !== "number"
  ) {
    return null;
  }

  const address = [
    settings.companyAddress,
    settings.companyCity,
    settings.companyState,
    settings.companyZip,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    type: "business",
    label: settings.companyName || "Business Location",
    latitude: settings.businessLatitude,
    longitude: settings.businessLongitude,
    address,
  };
}

function formatDistance(meters?: number | null) {
  if (typeof meters !== "number") return "Not calculated";
  const miles = meters / 1609.344;
  return `${miles.toFixed(miles >= 10 ? 0 : 1)} mi`;
}

function formatDuration(seconds?: number | null) {
  if (typeof seconds !== "number") return "Not calculated";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(value?: string | null) {
  if (!value) return "Unscheduled";
  const [rawHour, rawMinute = "00"] = value.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${rawMinute} ${suffix}`;
}

function addSecondsToDateTime(date: string, time: string, seconds: number) {
  const base = new Date(`${date}T${time || "08:00"}`);
  if (Number.isNaN(base.getTime())) return null;
  return new Date(base.getTime() + seconds * 1000);
}

function minutesAfterSchedule(
  eta: Date | null,
  date?: string,
  time?: string
) {
  if (!eta || !date || !time) return null;
  const scheduled = new Date(`${date}T${time}`);
  if (Number.isNaN(scheduled.getTime())) return null;
  return Math.round((eta.getTime() - scheduled.getTime()) / 60000);
}

function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export default function LogisticsPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [selectedStatus, setSelectedStatus] = useState("Scheduled");
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateInput(new Date())
  );
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [localClientEvents, setLocalClientEvents] = useStoredJsonState<
    ClientCalendarEvent[]
  >(storageKeys.clientCalendarEvents, []);
  const [cachedSettings] = useStoredJsonState<CachedWorkspaceSettings[]>(
    storageKeys.settings,
    []
  );
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
  const [databaseClientEvents, setDatabaseClientEvents] = useState<
    ClientCalendarEvent[]
  >([]);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [routePath, setRoutePath] = useState<Array<[number, number]>>([]);
  const [routeLegDurationSeconds, setRouteLegDurationSeconds] = useState<number[]>([]);
  const [routeSummary, setRouteSummary] = useState<{
    totalDistanceMeters?: number;
    totalDurationSeconds?: number;
    provider?: "nearest_neighbor" | "openroute_service" | "google_traffic";
    mode?: RouteMode;
    startsAtOrigin?: boolean;
    returnsToOrigin?: boolean;
    legDurationSource?: "provider" | "estimate";
    warning?: string;
  } | null>(null);
  const [trafficStatus, setTrafficStatus] = useState<{
    available: boolean;
    message: string;
  }>({ available: false, message: "Traffic-aware routing is disabled for this workspace/environment." });
  const [routeError, setRouteError] = useState("");
  const [businessOrigin, setBusinessOrigin] = useState<RouteOrigin | null>(null);
  const [currentOrigin, setCurrentOrigin] = useState<RouteOrigin | null>(null);
  const [originMode, setOriginMode] = useState<"business" | "current">("business");
  const [isLocating, setIsLocating] = useState(false);
  const [geocodingClientId, setGeocodingClientId] = useState("");
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [isTrafficRouting, setIsTrafficRouting] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients, setLocalClients }), [isDatabaseMode, localClients, setLocalClients, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs, setLocalJobs }), [isDatabaseMode, localJobs, setLocalJobs, supabase]);
  const eventsRepo = useMemo(() => createCalendarEventsRepository({ isSignedIn: isDatabaseMode, supabase, localEvents: localClientEvents, setLocalEvents: setLocalClientEvents }), [isDatabaseMode, localClientEvents, setLocalClientEvents, supabase]);
  const routesRepo = useMemo(() => createRoutesRepository({ isSignedIn: isDatabaseMode, supabase }), [isDatabaseMode, supabase]);
  const clients = isDatabaseMode ? databaseClients : localClients;
  const jobs = isDatabaseMode ? databaseJobs : localJobs;
  const clientEvents = isDatabaseMode ? databaseClientEvents : localClientEvents;
  const cachedWorkspaceSettings = cachedSettings.find(
    (settings) => settings.workspaceId === activeWorkspace.id
  );
  const activeOrigin = originMode === "current" ? currentOrigin : businessOrigin;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      clientsRepo.getClients(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
      eventsRepo.getEvents(activeWorkspace.id),
      routesRepo.getRoutes(activeWorkspace.id),
    ])
      .then(([loadedClients, loadedJobs, loadedEvents, loadedRoutes]) => {
        if (!cancelled) {
          setDatabaseClients(loadedClients);
          setDatabaseJobs(loadedJobs);
          setDatabaseClientEvents(loadedEvents);
          setRoutes(loadedRoutes);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRouteError(
            error instanceof Error
              ? error.message
              : "Unable to load logistics data."
          );
        }
      });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, eventsRepo, isDatabaseMode, jobsRepo, routesRepo]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/logistics/route")
      .then((response) => response.json())
      .then((payload: { data?: RouteProviderStatus }) => {
        if (cancelled) return;
        const googleTraffic = payload.data?.providers?.google_traffic;
        if (!googleTraffic) return;
        setTrafficStatus({
          available: googleTraffic.available,
          message:
            googleTraffic.message ||
            "Traffic-aware routing is available as a premium routing provider.",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setTrafficStatus({
            available: false,
            message: "Traffic-aware routing status could not be loaded.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDatabaseMode) {
      Promise.resolve().then(() => {
        setBusinessOrigin(settingsToRouteOrigin(cachedWorkspaceSettings));
      });
      return;
    }

    let cancelled = false;
    fetch(`/api/workspaces/settings?workspaceId=${activeWorkspace.id}`)
      .then((response) => response.json())
      .then((payload: WorkspaceSettingsResponse) => {
        if (cancelled) return;
        const origin =
          settingsToRouteOrigin(payload.settings) ||
          settingsToRouteOrigin(cachedWorkspaceSettings);
        setBusinessOrigin(origin);
        setOriginMode((current) => (currentOrigin && current === "current" ? current : "business"));
      })
      .catch(() => {
        if (!cancelled) {
          setBusinessOrigin(settingsToRouteOrigin(cachedWorkspaceSettings));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, cachedWorkspaceSettings, currentOrigin, isDatabaseMode]);

  const workspaceClients = useMemo(() => {
    return clients.filter(
      (client) => client.workspaceId === activeWorkspace.id
    );
  }, [clients, activeWorkspace.id]);

  const filteredClients = useMemo(() => {
    if (selectedStatus === "Scheduled") return [];
    if (selectedStatus === "All") return workspaceClients;

    return workspaceClients.filter(
      (client) => client.status === selectedStatus
    );
  }, [workspaceClients, selectedStatus]);
  const stopClientScope =
    selectedStatus === "Scheduled" ? workspaceClients : filteredClients;

  const workspaceJobs = useMemo(() => {
    return jobs.filter((job) => job.workspaceId === activeWorkspace.id);
  }, [jobs, activeWorkspace.id]);

  const scheduledJobs = useMemo(
    () =>
      workspaceJobs.filter(
        (job) =>
          job.date === selectedDate &&
          job.status !== "Completed" &&
          job.status !== "Paid"
      ),
    [selectedDate, workspaceJobs]
  );

  const scheduledClientEvents = useMemo(
    () =>
      clientEvents.filter(
        (event) =>
          event.workspaceId === activeWorkspace.id &&
          event.date === selectedDate
      ),
    [activeWorkspace.id, clientEvents, selectedDate]
  );

  const visibleLocations = useMemo(() => {
    return dedupeLogisticsLocations([
      ...buildLogisticsLocations(filteredClients),
      ...buildJobLogisticsLocations(scheduledJobs, stopClientScope),
      ...buildClientEventLogisticsLocations(scheduledClientEvents, stopClientScope),
    ]).sort((a, b) =>
      (a.scheduledTime || "23:59").localeCompare(b.scheduledTime || "23:59") ||
      a.name.localeCompare(b.name)
    );
  }, [filteredClients, scheduledClientEvents, scheduledJobs, stopClientScope]);

  const missingCoordinateClients = useMemo(() => {
    return getMissingCoordinateClients(filteredClients);
  }, [filteredClients]);

  const selectedLocations = useMemo(() => {
    const locationsById = new Map(
      visibleLocations.map((location) => [location.id, location])
    );
    return selectedLocationIds
      .map((locationId) => locationsById.get(locationId))
      .filter((location): location is LogisticsLocation => Boolean(location));
  }, [visibleLocations, selectedLocationIds]);

  const selectedRouteableLocations = useMemo(
    () =>
      selectedLocations.filter(
        (location) => location.coordinateSource === "saved"
      ),
    [selectedLocations]
  );
  const canOptimizeSelectedRoute =
    selectedRouteableLocations.length >= 2 ||
    Boolean(activeOrigin && selectedRouteableLocations.length >= 1);

  const selectedTemporaryLocations = useMemo(
    () =>
      selectedLocations.filter(
        (location) => location.coordinateSource === "temporary"
      ),
    [selectedLocations]
  );

  const routeBuilderLocations = useMemo(() => {
    const selectedIds = new Set(selectedLocationIds);
    return [
      ...selectedLocations,
      ...visibleLocations.filter((location) => !selectedIds.has(location.id)),
    ];
  }, [selectedLocationIds, selectedLocations, visibleLocations]);

  const routeStartTime =
    selectedLocations.find((location) => location.scheduledTime)?.scheduledTime ??
    "08:00";
  const defaultStopServiceSeconds = 0;
  const hasRouteLegDurations = routeLegDurationSeconds.length > 0;
  const projectedStops = useMemo(() => {
    return selectedLocations.map((location, index) => {
      if (!hasRouteLegDurations) {
        return { location, eta: null, lateMinutes: null };
      }
      const travelLegCount = routeSummary?.startsAtOrigin ? index + 1 : index;
      const travelSeconds = routeLegDurationSeconds
        .slice(0, travelLegCount)
        .reduce((total, seconds) => total + seconds, 0);
      const serviceSeconds = defaultStopServiceSeconds * index;
      const elapsedSeconds = travelSeconds + serviceSeconds;
      const firstScheduledTime = selectedLocations[0]?.scheduledTime;
      const firstTravelSeconds = routeSummary?.startsAtOrigin
        ? routeLegDurationSeconds[0] ?? 0
        : 0;
      const scheduleAwareBase =
        routeSummary?.mode === "schedule_aware" && firstScheduledTime
          ? new Date(
              new Date(`${selectedDate}T${firstScheduledTime}`).getTime() -
                firstTravelSeconds * 1000
            )
          : null;
      const eta =
        scheduleAwareBase && !Number.isNaN(scheduleAwareBase.getTime())
          ? new Date(scheduleAwareBase.getTime() + elapsedSeconds * 1000)
          : addSecondsToDateTime(selectedDate, routeStartTime, elapsedSeconds);
      const lateMinutes = minutesAfterSchedule(
        eta,
        location.scheduledDate,
        location.scheduledTime
      );
      return { location, eta, lateMinutes };
    });
  }, [hasRouteLegDurations, routeLegDurationSeconds, routeStartTime, routeSummary?.mode, routeSummary?.startsAtOrigin, selectedDate, selectedLocations]);
  const lateStopSummary = useMemo(() => {
    const lateStops = projectedStops.filter(
      (stop) => stop.lateMinutes !== null && stop.lateMinutes > 0
    );
    const worstLateMinutes = lateStops.reduce(
      (worst, stop) => Math.max(worst, stop.lateMinutes ?? 0),
      0
    );
    return {
      count: lateStops.length,
      worstLateMinutes,
    };
  }, [projectedStops]);

  function toggleLocation(locationId: string) {
    setRoutePath([]);
    setRouteLegDurationSeconds([]);
    setRouteSummary(null);
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId]
    );
  }

  function selectAllVisibleLocations() {
    setRoutePath([]);
    setRouteLegDurationSeconds([]);
    setRouteSummary(null);
    setSelectedLocationIds(visibleLocations.map((location) => location.id));
  }

  function clearRoute() {
    setRoutePath([]);
    setRouteLegDurationSeconds([]);
    setRouteSummary(null);
    setSelectedLocationIds([]);
  }

  function getSelectedRouteNumber(locationId: string) {
    return (
      selectedLocations.findIndex((location) => location.id === locationId) + 1
    );
  }

  function googleMapsPoint(location: LogisticsLocation | RouteOrigin) {
    if ("coordinateSource" in location) {
      return location.coordinateSource === "saved"
        ? `${location.latitude},${location.longitude}`
        : getClientFullAddress(location);
    }
    return `${location.latitude},${location.longitude}`;
  }

  function buildGoogleMapsUrl(routeLocations: LogisticsLocation[]) {
    if (routeLocations.length < 2 && !activeOrigin) return "#";
    if (routeLocations.length === 0) return "#";
    const routePoints: Array<LogisticsLocation | RouteOrigin> = activeOrigin
      ? [activeOrigin, ...routeLocations, activeOrigin]
      : routeLocations;
    if (routePoints.length < 2) return "#";

    const origin = encodeURIComponent(googleMapsPoint(routePoints[0]));

    const destination = encodeURIComponent(
      googleMapsPoint(routePoints[routePoints.length - 1])
    );

    const waypoints = routePoints
      .slice(1, -1)
      .map((location) => encodeURIComponent(googleMapsPoint(location)))
      .join("|");

    const waypointParam = waypoints ? `&waypoints=${waypoints}` : "";

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointParam}&travelmode=driving`;
    return url.length <= maxGoogleMapsUrlLength ? url : "";
  }

  const googleMapsUrl = buildGoogleMapsUrl(selectedLocations);
  const canOpenGoogleMaps =
    (selectedLocations.length >= 2 || Boolean(activeOrigin && selectedLocations.length >= 1)) &&
    Boolean(googleMapsUrl);
  const activeRoutePath = routePath.length >= 2
    ? routePath
    : [
        ...(activeOrigin && selectedRouteableLocations.length > 0
          ? [[activeOrigin.latitude, activeOrigin.longitude] as [number, number]]
          : []),
        ...selectedRouteableLocations.map((location) => [location.latitude, location.longitude] as [number, number]),
        ...(activeOrigin && selectedRouteableLocations.length > 0
          ? [[activeOrigin.latitude, activeOrigin.longitude] as [number, number]]
          : []),
      ];
  const hasRoadRoute =
    routePath.length >= 2 &&
    (routeSummary?.provider === "openroute_service" ||
      routeSummary?.provider === "google_traffic");
  const showingSimpleRoutePreview =
    selectedRouteableLocations.length >= 2 && !hasRoadRoute;
  let etaSourceLabel = "ETA unavailable until route is optimized";
  if (hasRouteLegDurations && routeSummary?.mode === "schedule_aware") {
    etaSourceLabel = "ETA from schedule-aware route";
  } else if (hasRouteLegDurations && routeSummary?.provider === "google_traffic") {
    etaSourceLabel =
      routeSummary.legDurationSource === "estimate"
        ? "Approximate stop ETAs from estimated legs; total duration is traffic-aware"
        : "ETA from traffic-aware route";
  } else if (hasRouteLegDurations && routeSummary?.provider === "openroute_service") {
    etaSourceLabel = "ETA from road-following route";
  } else if (hasRouteLegDurations && routeSummary?.provider === "nearest_neighbor") {
    etaSourceLabel = "Approximate ETA from nearest-neighbor estimate";
  } else if (showingSimpleRoutePreview) {
    etaSourceLabel = "Approximate ETA from simple preview";
  }

  async function geocodeClient(clientId: string) {
    if (!isDatabaseMode) {
      setRouteError("Sign in to geocode and save client coordinates.");
      return;
    }

    setGeocodingClientId(clientId);
    setRouteError("");

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          clientId,
        }),
      });
      const payload = (await response.json()) as {
        data?: {
          clientId: string;
          latitude: number;
          longitude: number;
        };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Address could not be geocoded.");
      }

      setDatabaseClients((current) =>
        current.map((client) =>
          client.id === payload.data?.clientId
            ? {
                ...client,
                latitude: payload.data.latitude,
                longitude: payload.data.longitude,
              }
            : client
        )
      );
      setSelectedLocationIds((current) =>
        current.includes(clientId) ? current : [...current, clientId]
      );
    } catch (error) {
      setRouteError(
        error instanceof Error ? error.message : "Address could not be geocoded."
      );
    } finally {
      setGeocodingClientId("");
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setRouteError("Current location is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setRouteError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentOrigin({
          type: "current",
          label: "Current Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setOriginMode("current");
        setRoutePath([]);
        setRouteSummary(null);
        setRouteLegDurationSeconds([]);
        setIsLocating(false);
      },
      () => {
        setRouteError("Current location could not be loaded.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function useBusinessLocation() {
    if (!businessOrigin) {
      setRouteError("Save and geocode your business address in Settings first.");
      return;
    }
    setOriginMode("business");
    setRoutePath([]);
    setRouteSummary(null);
    setRouteLegDurationSeconds([]);
    setRouteError("");
  }

  function isHardScheduledStop(location: LogisticsLocation) {
    return location.scheduledDate === selectedDate && Boolean(location.scheduledTime);
  }

  function buildEstimatedScheduleSummary(orderedLocations: LogisticsLocation[]) {
    const routePoints = [
      ...(activeOrigin
        ? [
            {
              latitude: activeOrigin.latitude,
              longitude: activeOrigin.longitude,
            },
          ]
        : []),
      ...orderedLocations.map((location) => ({
        latitude: location.latitude,
        longitude: location.longitude,
      })),
      ...(activeOrigin
        ? [
            {
              latitude: activeOrigin.latitude,
              longitude: activeOrigin.longitude,
            },
          ]
        : []),
    ];
    const legDistancesMeters = routePoints.slice(1).map((point, index) =>
      distanceMeters(routePoints[index], point)
    );
    const totalDistanceMeters = legDistancesMeters.reduce(
      (total, distance) => total + distance,
      0
    );
    const legDurationSeconds = legDistancesMeters.map((distance) =>
      Math.round(distance / 13.4)
    );
    return {
      routePath: routePoints.map(
        (point) => [point.latitude, point.longitude] as [number, number]
      ),
      legDurationSeconds,
      totalDistanceMeters,
      totalDurationSeconds: legDurationSeconds.reduce(
        (total, seconds) => total + seconds,
        0
      ),
    };
  }

  function optimizeAroundSchedule() {
    if (selectedRouteableLocations.length < 1) {
      setRouteError("Select at least one geocoded stop before optimizing around schedule.");
      return;
    }

    const hardScheduledStops = selectedRouteableLocations
      .filter(isHardScheduledStop)
      .sort((a, b) =>
        (a.scheduledTime || "23:59").localeCompare(b.scheduledTime || "23:59") ||
        a.name.localeCompare(b.name)
      );
    const hardStopIds = new Set(hardScheduledStops.map((location) => location.id));
    const flexibleStops = selectedRouteableLocations.filter(
      (location) => !hardStopIds.has(location.id)
    );
    const temporarySelectedStops = selectedLocations.filter(
      (location) => location.coordinateSource !== "saved"
    );
    const orderedLocations = [
      ...hardScheduledStops,
      ...flexibleStops,
      ...temporarySelectedStops,
    ];
    const summary = buildEstimatedScheduleSummary(orderedLocations);

    setSelectedLocationIds(orderedLocations.map((location) => location.id));
    setRoutePath(summary.routePath);
    setRouteLegDurationSeconds(summary.legDurationSeconds);
    setRouteSummary({
      totalDistanceMeters: summary.totalDistanceMeters,
      totalDurationSeconds: summary.totalDurationSeconds,
      provider: "nearest_neighbor",
      mode: "schedule_aware",
      startsAtOrigin: Boolean(activeOrigin),
      returnsToOrigin: Boolean(activeOrigin),
      legDurationSource: "estimate",
      warning:
        flexibleStops.length > 0
          ? "Schedule-aware route keeps timed stops in order and places flexible stops after scheduled appointments."
          : undefined,
    });
    setRouteError("");
  }

  async function optimizeRoute(provider: "openroute_service" | "google_traffic" = "openroute_service") {
    if (!isDatabaseMode) return;
    if (selectedRouteableLocations.length < 2 && !activeOrigin) {
      setRouteError("Geocode at least two selected stops before optimizing the route.");
      return;
    }
    if (selectedRouteableLocations.length < 1) {
      setRouteError("Select at least one geocoded stop before optimizing the route.");
      return;
    }

    if (provider === "google_traffic") {
      setIsTrafficRouting(true);
    } else {
      setIsOptimizingRoute(true);
    }
    setRouteError("");

    try {
      const response = await fetch("/api/logistics/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          provider,
          stops: selectedRouteableLocations.map((location) => ({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            addressSnapshot: getClientFullAddress(location),
          })),
          origin: activeOrigin
            ? {
                id: `origin-${activeOrigin.type}`,
                label: activeOrigin.label,
                latitude: activeOrigin.latitude,
                longitude: activeOrigin.longitude,
              }
            : undefined,
        }),
      });
      const payload = (await response.json()) as RouteApiResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Unable to optimize route.");
      }

      setSelectedLocationIds(payload.data.orderedStopIds);
      setRoutePath(payload.data.routePath ?? []);
      setRouteLegDurationSeconds(payload.data.legDurationSeconds ?? []);
      setRouteSummary({
        totalDistanceMeters: payload.data.totalDistanceMeters,
        totalDurationSeconds: payload.data.totalDurationSeconds,
        provider: payload.data.routeProvider,
        mode: provider === "google_traffic" ? "traffic" : "road",
        startsAtOrigin: payload.data.startsAtOrigin,
        returnsToOrigin: payload.data.returnsToOrigin,
        legDurationSource: payload.data.legDurationSource,
        warning: payload.data.warning,
      });
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "Unable to optimize route.");
    } finally {
      setIsOptimizingRoute(false);
      setIsTrafficRouting(false);
    }
  }

  async function saveRoute() {
    if (!isDatabaseMode || selectedLocations.length === 0) return;
    if (selectedLocations.length >= 2 && !googleMapsUrl) {
      setRouteError("Too many route stops for Google Maps export. Reduce stop count.");
      return;
    }

    const route: RoutePlan = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: `Route ${new Date().toLocaleDateString()}`,
      googleMapsUrl,
      totalDistanceMeters: routeSummary?.totalDistanceMeters ?? null,
      totalDurationSeconds: routeSummary?.totalDurationSeconds ?? null,
      notes: routeSummary?.provider
        ? `Route provider: ${routeSummary.provider}`
        : undefined,
      stops: selectedLocations.map((location, index) => ({
        clientId: location.clientId,
        stopOrder: index + 1,
        latitude:
          location.coordinateSource === "saved" ? location.latitude : null,
        longitude:
          location.coordinateSource === "saved" ? location.longitude : null,
        addressSnapshot: getClientFullAddress(location),
      })),
    };
    const result = await createRoutePlanAction(routesRepo, route);
    if (!result.ok) {
      setRouteError(result.error);
      return;
    }
    setRouteError("");
    setRoutes((current) => [result.data, ...current]);
  }

  function loadSavedRoute(route: RoutePlan) {
    const visibleLocationIds = new Set(visibleLocations.map((location) => location.id));
    const orderedClientIds = route.stops
      .slice()
      .sort((a, b) => a.stopOrder - b.stopOrder)
      .map((stop) => stop.clientId)
      .filter((clientId) => visibleLocationIds.has(clientId));

    if (orderedClientIds.length === 0) {
      setRouteError("Saved route stops are not visible in the current filter.");
      return;
    }

    setSelectedLocationIds(orderedClientIds);
    setRoutePath(
      route.stops
        .slice()
        .sort((a, b) => a.stopOrder - b.stopOrder)
        .filter(
          (stop) =>
            typeof stop.latitude === "number" &&
            typeof stop.longitude === "number"
        )
        .map((stop) => [stop.latitude, stop.longitude] as [number, number])
    );
    setRouteLegDurationSeconds([]);
    setRouteSummary({
      totalDistanceMeters: route.totalDistanceMeters ?? undefined,
      totalDurationSeconds: route.totalDurationSeconds ?? undefined,
      mode: "saved",
      warning: route.notes?.includes("Route provider:")
        ? undefined
        : route.notes,
    });
    setRouteError("");
  }

  async function deleteSavedRoute(routeId: string) {
    setDeletingRouteId(routeId);
    const result = await deleteRoutePlanAction(
      routesRepo,
      routeId,
      activeWorkspace.id
    );
    setDeletingRouteId("");

    if (!result.ok) {
      setRouteError(result.error);
      return;
    }

    setRoutes((current) => current.filter((route) => route.id !== routeId));
    setRouteError("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              clearRoute();
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm sm:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <select
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value);
              clearRoute();
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm sm:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {stopFilters.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:max-w-md">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            Route Start
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {activeOrigin
              ? `${activeOrigin.label}${activeOrigin.address ? ` - ${activeOrigin.address}` : ""}`
              : "No route start selected."}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={useBusinessLocation}
              disabled={!businessOrigin || originMode === "business"}
              className="rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Use Business Location
            </button>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLocating}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLocating ? "Locating..." : "Use Current Location"}
            </button>
          </div>
          {!businessOrigin && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Save your business address in Settings to show it here.
            </p>
          )}
        </div>
      </div>

      {routeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {routeError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Client Location Map
              </h2>

              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Select client pins to build a route.
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {selectedLocations.length} selected
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <LogisticsMap
              locations={visibleLocations}
              selectedLocationIds={selectedLocationIds}
              origin={activeOrigin}
              routePath={activeRoutePath}
              isRoadRoute={hasRoadRoute}
              onToggleLocation={toggleLocation}
            />
          </div>

          {visibleLocations.length === 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              No client locations found for this filter.
            </div>
          )}

          {missingCoordinateClients.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="font-semibold">Missing coordinates</div>
              <p className="mt-1">
                Geocode saved addresses to replace temporary map positions:
              </p>
              <div className="mt-3 space-y-2">
                {missingCoordinateClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col gap-2 rounded-lg bg-white/70 p-3 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>{client.name}</span>
                    {client.hasAddress ? (
                      <button
                        type="button"
                        onClick={() => geocodeClient(client.id)}
                        disabled={!isDatabaseMode || geocodingClientId === client.id}
                        className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {geocodingClientId === client.id ? "Geocoding..." : "Geocode"}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold">Add an address first</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Geocoding data &copy; OpenStreetMap contributors.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Route Builder
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Add or remove client stops from the route.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={selectAllVisibleLocations}
                disabled={visibleLocations.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
              >
                + Add All
              </button>

              <button
                type="button"
                onClick={clearRoute}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Clear Route
              </button>

              {isDatabaseMode && (
                <>
                  <button
                    type="button"
                    onClick={() => optimizeRoute()}
                    disabled={!canOptimizeSelectedRoute || isOptimizingRoute}
                    className="w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/30 sm:w-auto"
                  >
                    {isOptimizingRoute ? "Calculating..." : "Optimize Road Route"}
                  </button>

                  <button
                    type="button"
                    onClick={optimizeAroundSchedule}
                    disabled={selectedRouteableLocations.length < 1}
                    className="w-full rounded-lg border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-950/30 sm:w-auto"
                  >
                    Optimize Around Schedule
                  </button>

                  {trafficStatus.available ? (
                    <button
                      type="button"
                      onClick={() => optimizeRoute("google_traffic")}
                      disabled={!canOptimizeSelectedRoute || isTrafficRouting}
                      className="w-full rounded-lg border border-purple-600 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-purple-300 dark:hover:bg-purple-950/30 sm:w-auto"
                    >
                      {isTrafficRouting ? "Checking Traffic..." : "Use Traffic-Aware Route"}
                    </button>
                  ) : (
                    <div className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:max-w-64">
                      {trafficStatus.message}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={saveRoute}
                    disabled={selectedLocations.length === 0}
                    className="w-full rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-300 dark:hover:bg-green-950/30 sm:w-auto"
                  >
                    Save Route
                  </button>
                </>
              )}
            </div>

            {routes.length > 0 && (
              <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <div className="font-semibold">
                  {routes.length} saved route{routes.length === 1 ? "" : "s"}
                </div>

                {routes.slice(0, 5).map((route) => (
                  <div
                    key={route.id}
                    className="flex flex-col gap-2 rounded-lg bg-white p-3 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {route.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {route.stops.length} stop{route.stops.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadSavedRoute(route)}
                        className="rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSavedRoute(route.id)}
                        disabled={deletingRouteId === route.id}
                        className="rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        {deletingRouteId === route.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {trafficStatus.available && (
              <p className="mt-4 text-xs text-purple-700 dark:text-purple-300">
                Traffic-aware routing uses a higher-cost premium provider and only runs when clicked.
              </p>
            )}

            <div className="mt-6 space-y-3">
              {routeBuilderLocations.length > 0 ? (
                routeBuilderLocations.map((location) => {
                  const isSelected = selectedLocationIds.includes(location.id);
                  const routeNumber = getSelectedRouteNumber(location.id);

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => toggleLocation(location.id)}
                      className={`w-full rounded-xl border p-4 text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                            {location.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {location.sourceType === "job"
                              ? "Job"
                              : location.sourceType === "event"
                                ? "Calendar"
                                : "Client"} - {location.status}
                          </p>

                          {location.scheduledTime && (
                            <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                              Scheduled {formatTime(location.scheduledTime)}
                            </p>
                          )}

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {getClientFullAddress(location)}
                          </p>

                          {location.coordinateSource === "temporary" && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                              Temporary map position
                            </p>
                          )}
                        </div>

                        <span
                          className={`flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {isSelected ? routeNumber : "+"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No client locations available.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Suggested Route
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Current selected stop order.
            </p>

            <div className="mt-6 space-y-4">
              {selectedTemporaryLocations.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {selectedTemporaryLocations.length} selected stop
                  {selectedTemporaryLocations.length === 1 ? " uses" : "s use"} temporary map positioning. Google Maps will use the saved address; route optimization needs geocoded coordinates.
                </div>
              )}

              {showingSimpleRoutePreview && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                  Showing a simple route preview. Use route optimization to calculate a road-following route.
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Stops
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-950 dark:text-gray-100">
                    {selectedLocations.length}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Distance
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-950 dark:text-gray-100">
                    {formatDistance(routeSummary?.totalDistanceMeters)}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Duration
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-950 dark:text-gray-100">
                    {formatDuration(routeSummary?.totalDurationSeconds)}
                  </div>
                </div>
              </div>

              {routeSummary?.provider && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Route source:{" "}
                  {routeSummary.mode === "schedule_aware"
                    ? "Schedule-aware route"
                    : routeSummary.provider === "google_traffic"
                    ? "Google traffic-aware route"
                    : routeSummary.provider === "openroute_service"
                      ? "OpenRouteService geometry"
                      : "nearest-neighbor fallback"}
                  {routeSummary.returnsToOrigin
                    ? " with return to route start"
                    : ""}
                </p>
              )}

              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {etaSourceLabel}
              </p>

              {lateStopSummary.count > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  <div className="font-semibold">
                    {lateStopSummary.count} scheduled stop
                    {lateStopSummary.count === 1 ? "" : "s"} projected late.
                  </div>
                  <p className="mt-1">
                    Worst projected lateness: {lateStopSummary.worstLateMinutes} min.
                    {routeSummary?.mode === "schedule_aware"
                      ? " This route may still be impossible with the selected stops."
                      : " Try Optimize Around Schedule before driving this route."}
                  </p>
                </div>
              )}

              {routeSummary?.warning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {routeSummary.warning}
                </div>
              )}

              {projectedStops.length > 0 ? (
                projectedStops.map(({ location, eta, lateMinutes }, index) => (
                  <div
                    key={location.id}
                    className={`rounded-xl border p-4 ${
                      lateMinutes !== null && lateMinutes > 0
                        ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                          {location.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {location.sourceType === "job"
                            ? "Job stop - "
                            : location.sourceType === "event"
                              ? "Calendar stop - "
                              : "Client stop - "}
                          {getClientFullAddress(location)}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          ETA {eta ? formatTime(`${eta.getHours()}:${String(eta.getMinutes()).padStart(2, "0")}`) : "unavailable"}
                          {location.scheduledTime
                            ? ` · Scheduled ${formatTime(location.scheduledTime)}`
                            : ""}
                        </p>
                        {lateMinutes !== null && lateMinutes > 0 && (
                          <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-300">
                            Projected {lateMinutes} min late.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Select clients to build a route.
                </p>
              )}
            </div>

            <a
              href={canOpenGoogleMaps ? googleMapsUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!canOpenGoogleMaps}
              className={`mt-6 block w-full rounded-lg px-4 py-3 text-center font-semibold text-white ${
                canOpenGoogleMaps
                  ? "bg-green-600 hover:bg-green-700"
                  : "pointer-events-none cursor-not-allowed bg-gray-400"
              }`}
            >
              Open Route in Google Maps
            </a>
            {selectedLocations.length >= 2 && !googleMapsUrl && (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                Too many route stops for Google Maps export. Reduce stop count.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Fleet Planning Foundation
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {[
                "Vehicle assignment",
                "Driver assignment",
                "Route territory",
                "Route capacity",
                "Fleet route groups",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-dashed border-gray-300 p-3 text-gray-500 dark:border-gray-700 dark:text-gray-400"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
