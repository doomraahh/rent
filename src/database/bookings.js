import { findSpace } from "./spaces.js";
import { isValidDate } from "../utils/format.js";
import { isWithinHours } from "../utils/bookingTime.js";
import { findOffer, getSeatCount } from "../utils/spaceTypes.js";

export const storageKey = "coworking.bookings.v1";

function isStoredBooking(booking) {
  if (!booking || typeof booking.id !== "string" || !booking.id) return false;
  const offer = findOffer(findSpace(booking.spaceId), booking.type);
  if (!offer) return false;
  return (
    isValidDate(booking.date) &&
    isWithinHours(booking.start, booking.duration) &&
    Number.isFinite(booking.total) &&
    booking.total >= 0 &&
    typeof booking.name === "string" &&
    typeof booking.phone === "string" &&
    (booking.userId == null || typeof booking.userId === "string") &&
    (booking.seatId == null ||
      (Number.isInteger(booking.seatId) &&
        booking.seatId >= 1 &&
        booking.seatId <= getSeatCount(offer)))
  );
}

function isBookingList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const booking of value) {
    if (!isStoredBooking(booking) || ids.has(booking.id)) return false;
    ids.add(booking.id);
  }
  return true;
}

export function readBookings(storage = localStorage) {
  const raw = storage.getItem(storageKey);
  if (raw === null) return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "Бронирования повреждены. Исходные данные сохранены; новые записи заблокированы.",
    );
  }
  if (!isBookingList(data)) {
    throw new Error(
      "Некорректные данные бронирований. Исходные данные сохранены; новые записи заблокированы.",
    );
  }
  return data;
}

export function writeBookings(next, storage = localStorage) {
  if (!isBookingList(next)) {
    throw new Error("Не удалось сохранить некорректное бронирование");
  }
  storage.setItem(storageKey, JSON.stringify(next));
}
