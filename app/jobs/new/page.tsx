export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          New Job
        </h1>

        <p className="text-gray-500">
          Create a new job for a client
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">

          <div>
            <label className="block text-sm font-medium mb-2">
              Client
            </label>

            <input
              type="text"
              placeholder="John Smith"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Name
            </label>

            <input
              type="text"
              placeholder="Spring Cleanup"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Status
            </label>

            <select
              className="w-full border rounded-lg p-3"
              defaultValue="Lead"
            >
              <option>Lead</option>
              <option>Quoted</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estimated Value
            </label>

            <input
              type="text"
              placeholder="$500"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes
            </label>

            <textarea
              rows={5}
              placeholder="Job details..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Job
          </button>

        </form>
      </div>
    </div>
  );
}