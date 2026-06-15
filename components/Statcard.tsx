type StatCardProps = {
  title: string;
  value: string;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="min-w-0 rounded-lg bg-white p-3 shadow dark:bg-gray-900">
      <h2 className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        {title}
      </h2>

      <p className="mt-1 break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {value}
      </p>
    </div>
  );
}