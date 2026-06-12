type StatCardProps = {
  title: string;
  value: string;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}