import { findSpace } from "../database/spaces.js";
import { findOffer, getSeatCount } from "./spaceTypes.js";
import { formatHour, isValidDate } from "./format.js";

const openingHour = 9;
const closingHour = 21;
const maxDuration = 8;

export const startHours = Array.from(
  { length: closingHour - openingHour },
  (_, index) => openingHour + index,
);
export const durations = Array.from(
  { length: maxDuration },
  (_, index) => index + 1,
);

export function isWithinHours(start, duration) {
  return (
    Number.isInteger(start) &&
    start >= openingHour &&
    Number.isInteger(duration) &&
    duration >= 1 &&
    duration <= maxDuration &&
    start + duration <= closingHour
  );
}

export function bookingStart(booking) {
  return new Date(`${booking.date}T${formatHour(Number(booking.start))}:00`);
}

function bookingEnd(booking) {
  const end = bookingStart(booking);
  end.setHours(end.getHours() + Number(booking.duration));
  return end;
}

export function isCompleted(booking, now = new Date()) {
  return bookingEnd(booking) <= now;
}

export function sortBookings(bookings, now = new Date()) {
  return [...bookings].sort((a, b) => {
    const aDone = isCompleted(a, now);
    const bDone = isCompleted(b, now);
    if (aDone !== bDone) return aDone ? 1 : -1;
    const order = bookingStart(a) - bookingStart(b);
    return aDone ? -order : order;
  });
}

export function seatIsBusy(input, booking) {
  const start = Number(input.start);
  const end = start + Number(input.duration);
  const bookedStart = Number(booking.start);
  const bookedEnd = bookedStart + Number(booking.duration);
  return (
    booking.spaceId === input.spaceId &&
    booking.type === input.type &&
    booking.date === input.date &&
    start < bookedEnd &&
    end > bookedStart &&
    // Бронь без номера места занимает всё пространство этого типа.
    (input.seatId == null ||
      booking.seatId == null ||
      input.seatId === booking.seatId)
  );
}

export function isTimeAvailable(input, bookings, now = new Date()) {
  const start = Number(input.start);
  const duration = Number(input.duration);
  if (
    !isValidDate(input.date) ||
    !isWithinHours(start, duration) ||
    bookingStart(input) <= now
  )
    return false;
  const offer = findOffer(findSpace(input.spaceId), input.type);
  if (!offer) return false;
  const seatCount = getSeatCount(offer);
  for (let seatId = 1; seatId <= seatCount; seatId++) {
    const candidate = { ...input, start, duration, seatId };
    if (!bookings.some((booking) => seatIsBusy(candidate, booking)))
      return true;
  }
  return false;
}

export function availableStarts(input, bookings, now = new Date()) {
  return startHours.filter((start) =>
    isTimeAvailable({ ...input, start, duration: 1 }, bookings, now),
  );
}

export function availableDurations(input, bookings, now = new Date()) {
  return durations.filter((duration) =>
    isTimeAvailable({ ...input, duration }, bookings, now),
  );
}

export function adjustBookingTime(input, bookings, now = new Date()) {
  const starts = availableStarts(input, bookings, now);
  const start = starts.includes(Number(input.start))
    ? Number(input.start)
    : starts[0];
  if (start == null) return { ...input, start: "", duration: "", seatId: null };
  const options = availableDurations({ ...input, start }, bookings, now);
  const duration =
    options.findLast((value) => value <= Number(input.duration)) ?? options[0];
  return { ...input, start: String(start), duration: String(duration) };
}
