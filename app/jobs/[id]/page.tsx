import { jobs } from "@/lib/jobs";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="p-6">
        <h1>Job not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {job.name}
        </h1>

        <p className="text-gray-500">
          {job.client}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Job Information
        </h2>

        <div className="space-y-3">
          <p>
            <strong>Client:</strong> {job.client}
          </p>

          <div className="flex items-center gap-2">
            <strong>Status:</strong>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                job.status === "Lead"
                  ? "bg-gray-400 text-gray-700"
                  : job.status === "Quoted"
                  ? "bg-yellow-100 text-yellow-700"
                  : job.status === "Scheduled"
                  ? "bg-blue-100 text-blue-700"
                  : job.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {job.status}
            </span>
          </div>

          <p>
            <strong>Scheduled Date:</strong> {job.date}
          </p>

          <p>
            <strong>Estimated Value:</strong> {job.value}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Materials
        </h2>

        <ul className="list-disc ml-6">
          <li>5 bags mulch</li>
          <li>Fertilizer</li>
          <li>Trimmer line</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Notes
        </h2>

        <p>
          Customer requested cleanup around front flower beds.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Invoice
        </h2>

        <p>Total: {job.value}</p>
        <p>Status: Unpaid</p>
      </div>
    </div>
  );
}