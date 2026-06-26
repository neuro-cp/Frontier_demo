export function formatDateOnly(value?: string | null) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime12Hour(value?: string | null) {
  if (!value) return "";
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatDateTime12Hour(date?: string | null, time?: string | null) {
  const formattedDate = formatDateOnly(date);
  const formattedTime = formatTime12Hour(time);
  return formattedTime ? `${formattedDate} at ${formattedTime}` : formattedDate;
}
