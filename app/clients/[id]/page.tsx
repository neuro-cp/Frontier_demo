export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Client #{id}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Client Information
        </h2>

        <p>Name: John Smith</p>
        <p>Phone: (555) 123-4567</p>
        <p>Email: john@example.com</p>
        <p>Balance Due: $450</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Jobs
        </h2>

        <ul>
          <li>Spring Cleanup</li>
          <li>Mulch Installation</li>
          <li>Weekly Maintenance</li>
        </ul>
      </div>
    </div>
  );
}