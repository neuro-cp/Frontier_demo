"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Employee = {
  id: string;
  user_id: string | null;
  invited_email: string | null;
  status: string;
  created_at: string;
};

type Job = {
  id: string;
  name: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  client_name_snapshot: string | null;
};

type Assignment = {
  id: string;
  job_id: string;
  employee_user_id: string;
  status: "Assigned" | "Completed" | "Removed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type EmployeeAssignmentsSettingsProps = {
  activeWorkspaceId: string;
  setSavedNotice: (message: string) => void;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function employeeLabel(employee: Employee | undefined) {
  if (!employee) return "Unknown employee";
  return employee.invited_email || employee.user_id || "Employee";
}

export default function EmployeeAssignmentsSettings({
  activeWorkspaceId,
  setSavedNotice,
}: EmployeeAssignmentsSettingsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employeeUserId, setEmployeeUserId] = useState("");
  const [jobId, setJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "Active" && employee.user_id),
    [employees]
  );

  const employeeByUserId = useMemo(() => {
    return new Map(employees.filter((employee) => employee.user_id).map((employee) => [employee.user_id as string, employee]));
  }, [employees]);

  const jobById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);

  const loadAssignments = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError("");
    const response = await fetch(`/api/employee-assignments?workspaceId=${encodeURIComponent(activeWorkspaceId)}`);
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to load employee assignments.");
    setEmployees((payload.employees ?? []) as Employee[]);
    setJobs((payload.jobs ?? []) as Job[]);
    setAssignments((payload.assignments ?? []) as Assignment[]);
    if (showLoading) setIsLoading(false);
  }, [activeWorkspaceId]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsLoading(true);
    });
    fetch(`/api/employee-assignments?workspaceId=${encodeURIComponent(activeWorkspaceId)}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) throw new Error(payload.error ?? "Unable to load employee assignments.");
        setEmployees((payload.employees ?? []) as Employee[]);
        setJobs((payload.jobs ?? []) as Job[]);
        setAssignments((payload.assignments ?? []) as Assignment[]);
        setError("");
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load employee assignments.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId, loadAssignments]);

  async function assignEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employeeUserId || !jobId) return;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/employee-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          action: "assign",
          employeeUserId,
          jobId,
          notes,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to save assignment.");
      setEmployeeUserId("");
      setJobId("");
      setNotes("");
      await loadAssignments(false);
      setSavedNotice("Employee assignment saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save assignment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateAssignment(assignment: Assignment, status: "Assigned" | "Completed" | "Removed") {
    const response = await fetch("/api/employee-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        action: status === "Removed" ? "remove" : "update",
        assignmentId: assignment.id,
        status,
        notes: assignment.notes ?? "",
      }),
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      setError(payload.error ?? "Unable to update assignment.");
      return;
    }
    await loadAssignments(false);
    setSavedNotice(status === "Removed" ? "Assignment removed." : "Assignment updated.");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-2xl font-bold">Employee Assignments</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Assign active Employee members to jobs. Employee portal visibility is scoped to these assignments.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={assignEmployee} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={employeeUserId}
            onChange={(event) => setEmployeeUserId(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Select active employee</option>
            {activeEmployees.map((employee) => (
              <option key={employee.id} value={employee.user_id ?? ""}>
                {employeeLabel(employee)}
              </option>
            ))}
          </select>
          <select
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Select job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Assignment notes"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={isSaving || !employeeUserId || !jobId}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? "Saving..." : "Assign"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-2xl font-bold">Assignment History</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Employee</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Job</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Scheduled</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Status</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Notes</th>
                <th className="border-b border-gray-200 px-3 py-2 text-right dark:border-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">Loading assignments...</td></tr>
              ) : assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const job = jobById.get(assignment.job_id);
                  return (
                    <tr key={assignment.id}>
                      <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                        {employeeLabel(employeeByUserId.get(assignment.employee_user_id))}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{job?.name ?? assignment.job_id}</td>
                      <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                        {formatDate(job?.scheduled_date ?? null)}{job?.scheduled_time ? ` ${job.scheduled_time}` : ""}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{assignment.status}</td>
                      <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{assignment.notes || "-"}</td>
                      <td className="border-b border-gray-100 px-3 py-3 text-right dark:border-gray-800">
                        <div className="flex justify-end gap-2">
                          {assignment.status !== "Completed" && (
                            <button type="button" onClick={() => updateAssignment(assignment, "Completed")} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                              Complete
                            </button>
                          )}
                          <button type="button" onClick={() => updateAssignment(assignment, "Removed")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">No employee assignments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
