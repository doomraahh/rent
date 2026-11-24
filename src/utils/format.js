const numberFormat = new Intl.NumberFormat("ru-RU");
const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const money = (value) => `${numberFormat.format(value)} ₽`;
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function formatDate(date) {
  return dateFormat.format(new Date(`${date}T12:00:00`));
}

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return localDate(new Date(`${value}T12:00:00`)) === value;
}

export function formatTimeRange(start, duration) {
  return `${formatHour(start)}–${formatHour(start + duration)}`;
}

export function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}
