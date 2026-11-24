import { localDate, isValidDate } from "./format.js";
import { findSpace } from "../database/spaces.js";
import { findOffer, getSeatCount } from "./spaceTypes.js";
import { bookingStart, isWithinHours, seatIsBusy } from "./bookingTime.js";

export function validateBooking(input, bookings, now = new Date()) {
  const offer = findOffer(findSpace(input.spaceId), input.type);
  if (!offer) return "Выберите существующее пространство и тип бронирования";
  if (!isValidDate(input.date) || input.date < localDate(now))
    return "Выберите сегодняшнюю или будущую дату";
  if (!isWithinHours(Number(input.start), Number(input.duration)))
    return "Бронирование доступно с 09:00 до 21:00, от 1 до 8 часов";
  if (bookingStart(input) <= now) return "Выбранное время уже прошло";
  if (
    typeof input.name !== "string" ||
    !input.name.trim() ||
    input.name.trim().length > 80
  )
    return "Укажите имя длиной до 80 символов";
  const phone =
    typeof input.phone === "string" ? input.phone.replace(/\D/g, "") : "";
  if (phone.length < 10 || phone.length > 15 || input.phone.length > 24)
    return "Укажите телефон: от 10 до 15 цифр";
  if (
    !Number.isInteger(input.seatId) ||
    input.seatId < 1 ||
    input.seatId > getSeatCount(offer)
  )
    return "Выберите место на схеме";
  if (bookings.some((b) => seatIsBusy(input, b)))
    return "Это место уже забронировано на выбранное время. Выберите другой интервал";
  return "";
}
