import OperationsActivityPanel from "@/app/dashboard/OperationsActivityPanel";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workspace Activity</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Lightweight operational timeline for customer messages, employee updates, payments, estimates, and invoice aging.
        </p>
      </div>
      <OperationsActivityPanel />
    </div>
  );
}
