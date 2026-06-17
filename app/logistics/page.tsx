"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";
import { ClientRow, loadClients } from "@/lib/frontierClients";
import {
  buildLogisticsLocations,
  getClientFullAddress,
  LogisticsLocation,
} from "./logisticsData";

const LogisticsMap = dynamic(() => import("./LogisticsMap"), {
  ssr: false,
});

const clientStatuses = ["All", "Lead", "Active", "Inactive"];

export default function LogisticsPage() {
  const { activeWorkspace } = useWorkspace();

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);

  useEffect(() => {
    setClients(loadClients());
  }, []);

  const workspaceClients = useMemo(() => {
    return clients.filter(
      (client) => client.workspaceId === activeWorkspace.id
    );
  }, [clients, activeWorkspace.id]);

  const filteredClients = useMemo(() => {
    if (selectedStatus === "All") return workspaceClients;

    return workspaceClients.filter(
      (client) => client.status === selectedStatus
    );
  }, [workspaceClients, selectedStatus]);

  const visibleLocations = useMemo(() => {
    return buildLogisticsLocations(filteredClients).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filteredClients]);

  const selectedLocations = useMemo(() => {
    return visibleLocations.filter((location) =>
      selectedLocationIds.includes(location.id)
    );
  }, [visibleLocations, selectedLocationIds]);

  function toggleLocation(locationId: string) {
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId]
    );
  }

  function selectAllVisibleLocations() {
    setSelectedLocationIds(visibleLocations.map((location) => location.id));
  }

  function clearRoute() {
    setSelectedLocationIds([]);
  }

  function getSelectedRouteNumber(locationId: string) {
    return (
      selectedLocations.findIndex((location) => location.id === locationId) + 1
    );
  }

  function buildGoogleMapsUrl(routeLocations: LogisticsLocation[]) {
    if (routeLocations.length < 2) return "#";

    const origin = encodeURIComponent(
      `${routeLocations[0].latitude},${routeLocations[0].longitude}`
    );

    const destination = encodeURIComponent(
      `${routeLocations[routeLocations.length - 1].latitude},${
        routeLocations[routeLocations.length - 1].longitude
      }`
    );

    const waypoints = routeLocations
      .slice(1, -1)
      .map((location) =>
        encodeURIComponent(`${location.latitude},${location.longitude}`)
      )
      .join("|");

    const waypointParam = waypoints ? `&waypoints=${waypoints}` : "";

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointParam}&travelmode=driving`;
  }

  const googleMapsUrl = buildGoogleMapsUrl(selectedLocations);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <select
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(event.target.value);
            setSelectedLocationIds([]);
          }}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm lg:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          {clientStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

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
            {visibleLocations.length > 0 ? (
              <LogisticsMap
                locations={visibleLocations}
                selectedLocationIds={selectedLocationIds}
                onToggleLocation={toggleLocation}
              />
            ) : (
              <div className="flex h-[500px] items-center justify-center bg-gray-50 text-lg text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                No client locations found for this filter.
              </div>
            )}
          </div>
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
            </div>

            <div className="mt-6 space-y-3">
              {visibleLocations.length > 0 ? (
                visibleLocations.map((location) => {
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
                            {location.status}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {getClientFullAddress(location)}
                          </p>
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
              {selectedLocations.length > 0 ? (
                selectedLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
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
                          {getClientFullAddress(location)}
                        </p>
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
              href={selectedLocations.length >= 2 ? googleMapsUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={selectedLocations.length < 2}
              className={`mt-6 block w-full rounded-lg px-4 py-3 text-center font-semibold text-white ${
                selectedLocations.length >= 2
                  ? "bg-green-600 hover:bg-green-700"
                  : "pointer-events-none cursor-not-allowed bg-gray-400"
              }`}
            >
              Open Route in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}