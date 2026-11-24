import React, { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { findSpace } from "../database/spaces.js";
import { getCity } from "../database/cities.js";
import {
  money,
  localDate,
  formatDate,
  formatHour,
  formatTimeRange,
  isValidDate,
} from "../utils/format.js";
import { validateBooking } from "../utils/bookingValidation.js";
import {
  findOffer,
  getSeatCount,
  typeLabel,
  seatsLabel,
} from "../utils/spaceTypes.js";
import Interior from "../components/Interior.jsx";
import DatePicker from "../components/DatePicker.jsx";
import { useNow } from "../hooks/useNow.js";
import {
  startHours,
  durations,
  availableStarts,
  availableDurations,
  adjustBookingTime,
  isTimeAvailable,
  seatIsBusy,
} from "../utils/bookingTime.js";

export default function SpaceDetail({ bookings, save, user, storageReady }) {
  const { id } = useParams();
  const location = useLocation();
  const now = useNow();
  const space = findSpace(id);
  const [form, setForm] = useState(() => {
    if (!space) return null;

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const draft =
      location.state?.draft?.spaceId === id ? location.state.draft : null;
    const requestedType =
      draft?.type ?? new URLSearchParams(location.search).get("type");
    const initialForm = {
      spaceId: id,
      type: findOffer(space, requestedType)?.type ?? "desk",
      date: isValidDate(draft?.date) ? draft.date : localDate(tomorrow),
      start: draft?.start ?? "9",
      duration: draft?.duration ?? "2",
      name: user?.firstName || user?.name?.split(" ")[0] || "",
      phone: "",
      seatId: draft?.seatId ?? null,
    };
    return adjustBookingTime(initialForm, bookings, now);
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  if (!space)
    return (
      <div className="empty-state">
        <h1>Коворкинг не найден</h1>
        <Link to="/">В каталог</Link>
      </div>
    );
  const city = getCity(space.cityId);
  const offer = findOffer(space, form.type);
  const isDesk = offer.type === "desk";
  const offerLabel = typeLabel(offer.type);
  const seatCount = getSeatCount(offer);
  const candidate = {
    ...form,
    start: Number(form.start),
    duration: Number(form.duration),
  };
  const busy = (seat) =>
    bookings.some((b) => seatIsBusy({ ...candidate, seatId: seat }, b));
  const starts = availableStarts(candidate, bookings, now);
  const durationOptions = availableDurations(candidate, bookings, now);
  const validInterval = isTimeAvailable(candidate, bookings, now);
  const canSelectSeat = storageReady && validInterval;
  const selected =
    canSelectSeat &&
    Number.isInteger(form.seatId) &&
    form.seatId >= 1 &&
    form.seatId <= seatCount &&
    !busy(form.seatId);

  function updateInterval(name, value) {
    setForm((previous) =>
      adjustBookingTime(
        { ...previous, [name]: value, seatId: null },
        bookings,
        now,
      ),
    );
    setError("");
  }

  function changeInterval(event) {
    updateInterval(event.target.name, event.target.value);
  }

  function changeContact(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }
  function submit(e) {
    e.preventDefault();
    if (!user) {
      setError("Войдите в аккаунт для бронирования");
      return;
    }
    if (!selected) {
      setError("Выберите свободное место на схеме");
      return;
    }
    const message = validateBooking(candidate, bookings);
    if (message) {
      setError(message);
      return;
    }
    const booking = {
      ...candidate,
      userId: user.id,
      id: crypto.randomUUID(),
      total: offer.price * candidate.duration,
    };
    if (save([...bookings, booking])) {
      setSuccess(booking);
      setError("");
      window.scrollTo(0, 0);
    }
  }
  if (success)
    return (
      <section
        className="booking-confirmation"
        aria-labelledby="confirmation-title"
      >
        <h1 id="confirmation-title" role="status">
          Бронирование подтверждено
        </h1>
        <p className="lead">
          {space.name} · {city.name}
        </p>
        <dl className="reservation-facts">
          <div>
            <dt>Место</dt>
            <dd>
              {typeLabel(success.type)} · № {success.seatId}
            </dd>
          </div>
          <div>
            <dt>Дата</dt>
            <dd>{formatDate(success.date)}</dd>
          </div>
          <div>
            <dt>Время</dt>
            <dd>{formatTimeRange(success.start, success.duration)}</dd>
          </div>
          <div>
            <dt>Стоимость</dt>
            <dd>{money(success.total)}</dd>
          </div>
        </dl>
        <div className="confirmation-actions">
          <Link className="button" to="/bookings">
            Мои записи
          </Link>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setSuccess(null);
              setForm((previous) =>
                adjustBookingTime({ ...previous, seatId: null }, bookings, now),
              );
            }}
          >
            Забронировать ещё
          </button>
        </div>
      </section>
    );
  return (
    <>
      <Link className="back-link" to="/">
        В каталог
      </Link>
      <div className="page-heading">
        <h1>{isDesk ? "Выберите рабочее место" : "Выберите пространство"}</h1>
        <p className="lead">
          {space.name} · {city.name}
        </p>
      </div>
      <form className="reservation-layout" onSubmit={submit}>
        <section
          className="reservation-map-panel"
          aria-label="Выбор места и времени"
        >
          <div className="reservation-controls">
            <label className="form__field">
              Пространство
              <select
                className="form__control"
                name="type"
                value={form.type}
                onChange={changeInterval}
              >
                {space.offers.map((item) => (
                  <option key={item.type} value={item.type}>
                    {typeLabel(item.type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field">
              Дата
              <DatePicker
                min={localDate(now)}
                value={form.date}
                onChange={(date) => updateInterval("date", date)}
              />
            </label>
            <label className="form__field">
              Начало
              <select
                className="form__control"
                name="start"
                value={starts.includes(Number(form.start)) ? form.start : ""}
                onChange={changeInterval}
              >
                <option value="" disabled>
                  {starts.length ? "Выберите время" : "Нет времени"}
                </option>
                {startHours.map((h) => (
                  <option key={h} value={h} disabled={!starts.includes(h)}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field">
              Длительность
              <select
                className="form__control"
                name="duration"
                value={
                  durationOptions.includes(Number(form.duration))
                    ? form.duration
                    : ""
                }
                onChange={changeInterval}
              >
                <option value="" disabled>
                  {durationOptions.length
                    ? "Выберите длительность"
                    : "Нет вариантов"}
                </option>
                {durations.map((h) => (
                  <option
                    key={h}
                    value={h}
                    disabled={!durationOptions.includes(h)}
                  >
                    {h} ч
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!isDesk && (
            <h2 className="reservation-map-title">
              {offerLabel} · {seatsLabel(offer.capacity)}
            </h2>
          )}
          <div className="seat-legend">
            <span>
              <i />
              Свободно
            </span>
            <span>
              <i className="seat-legend__busy" />
              Занято
            </span>
            <span>
              <i className="seat-legend__selected" />
              Выбрано
            </span>
          </div>
          {!validInterval && (
            <p role="alert" className="alert">
              На выбранное время свободных мест нет
            </p>
          )}
          <div
            className={`seat-plan seat-grid${isDesk ? "" : " seat-grid--room"}`}
            role="group"
            aria-label="Схема мест"
          >
            {Array.from({ length: seatCount }, (_, i) => i + 1).map((seat) => {
              const occupied = busy(seat);
              const active = selected && form.seatId === seat;
              const status = active
                ? "Выбрано"
                : occupied
                  ? "Занято"
                  : canSelectSeat
                    ? "Свободно"
                    : "Недоступно";
              return (
                <button
                  key={seat}
                  type="button"
                  className={`seat${active ? " seat--selected" : ""}`}
                  disabled={!canSelectSeat || occupied}
                  aria-pressed={active}
                  aria-label={`${isDesk ? "Место" : offerLabel} ${seat}: ${status.toLowerCase()}`}
                  onClick={() => {
                    setForm({ ...form, seatId: seat });
                    setError("");
                  }}
                >
                  {String(seat).padStart(2, "0")}
                  <span className="seat__status">{status}</span>
                </button>
              );
            })}
          </div>
        </section>
        <aside className="reservation-summary" aria-label="Сводка бронирования">
          <Interior space={space} />
          <h2>{space.name}</h2>
          <p className="meta">
            {space.address} · {city.name}
          </p>
          <dl className="reservation-facts">
            <div>
              <dt>Дата</dt>
              <dd>{form.date ? formatDate(form.date) : "Не выбрана"}</dd>
            </div>
            <div>
              <dt>Время</dt>
              <dd>
                {validInterval
                  ? formatTimeRange(candidate.start, candidate.duration)
                  : "Не выбрано"}
              </dd>
            </div>
            <div>
              <dt>{offerLabel}</dt>
              <dd>{selected ? `№ ${form.seatId}` : "Не выбрано"}</dd>
            </div>
            <div>
              <dt>Тариф</dt>
              <dd>{money(offer.price)} / час</dd>
            </div>
          </dl>
          <div className="booking-total">
            <span>
              {validInterval ? `Итого за ${candidate.duration} ч` : "Итого"}
            </span>
            <strong className="booking-total__value">
              {validInterval ? money(offer.price * candidate.duration) : "—"}
            </strong>
          </div>
          {user ? (
            <>
              <div className="reservation-contact">
                <label className="form__field">
                  Имя
                  <input
                    required
                    className="form__control"
                    name="name"
                    autoComplete="given-name"
                    maxLength={80}
                    value={form.name}
                    onChange={changeContact}
                  />
                </label>
                <label className="form__field">
                  Телефон
                  <input
                    required
                    type="tel"
                    className="form__control"
                    name="phone"
                    autoComplete="tel"
                    maxLength={24}
                    value={form.phone}
                    onChange={changeContact}
                    placeholder="+7 900 000-00-00"
                  />
                </label>
              </div>
              {error && (
                <p className="alert" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button reservation-confirm"
                type="submit"
                disabled={!selected}
              >
                Подтвердить бронирование
              </button>
            </>
          ) : (
            <div className="reservation-login">
              <Link
                className="button"
                to="/login"
                state={{
                  from: `/coworkings/${space.id}?type=${form.type}`,
                  draft: {
                    spaceId: space.id,
                    type: form.type,
                    date: form.date,
                    start: form.start,
                    duration: form.duration,
                    seatId: form.seatId,
                  },
                }}
              >
                Войти и забронировать
              </Link>
            </div>
          )}
        </aside>
      </form>
    </>
  );
}
