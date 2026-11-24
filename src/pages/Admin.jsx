import React, { useState } from "react";
import { typeLabel } from "../utils/spaceTypes.js";
import { findSpace } from "../database/spaces.js";
import { money, formatTimeRange } from "../utils/format.js";
import CancelBooking from "../components/CancelBooking.jsx";

export default function Admin({
  accounts,
  user,
  bookings,
  cancelBooking,
  updateRole,
}) {
  const [tab, setTab] = useState("bookings");
  const [query, setQuery] = useState("");
  const [cancelId, setCancelId] = useState(null);
  const [error, setError] = useState("");
  const search = query.toLowerCase().trim();
  const filtered = bookings
    .map((booking) => ({
      booking,
      email: accounts.find((account) => account.id === booking.userId)?.email,
      spaceName: findSpace(booking.spaceId)?.name,
    }))
    .filter(({ booking, email, spaceName }) =>
      [booking.name, booking.phone, email, spaceName]
        .join(" ")
        .toLowerCase()
        .includes(search),
    )
    .sort(
      (a, b) =>
        a.booking.date.localeCompare(b.booking.date) ||
        a.booking.start - b.booking.start,
    );
  return (
    <>
      <div className="page-heading">
        <h1>Админ-панель</h1>
      </div>
      <div className="admin-stats">
        <div className="admin-stats__item">
          <span className="admin-stats__label">Пользователи</span>
          <strong className="admin-stats__value">{accounts.length}</strong>
        </div>
        <div className="admin-stats__item">
          <span className="admin-stats__label">Бронирования</span>
          <strong className="admin-stats__value">{bookings.length}</strong>
        </div>
        <div className="admin-stats__item">
          <span className="admin-stats__label">Сумма бронирований</span>
          <strong className="admin-stats__value">
            {money(bookings.reduce((sum, b) => sum + b.total, 0))}
          </strong>
        </div>
      </div>
      <div className="admin-tabs">
        <button
          className={tab === "bookings" ? "button" : "button button--secondary"}
          onClick={() => setTab("bookings")}
        >
          Бронирования
        </button>
        <button
          className={tab === "users" ? "button" : "button button--secondary"}
          onClick={() => setTab("users")}
        >
          Пользователи
        </button>
      </div>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {tab === "bookings" ? (
        <>
          <label className="form__field admin-search">
            Поиск бронирования
            <input
              className="form__control"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя, телефон, email или коворкинг"
            />
          </label>
          <div className="booking-list">
            {filtered.map(({ booking, email, spaceName }) => (
              <article className="booking-card" key={booking.id}>
                <div>
                  <h2 className="booking-card__title">{spaceName}</h2>
                  <p className="booking-card__text">
                    {typeLabel(booking.type)}
                    {booking.seatId != null && ` · № ${booking.seatId}`}
                  </p>
                  <p className="meta booking-card__text">
                    {booking.name} · {booking.phone}
                  </p>
                  <p className="meta booking-card__text">
                    {email || "Гостевая бронь"}
                  </p>
                </div>
                <div>
                  <strong className="booking-card__value">
                    {new Date(`${booking.date}T12:00:00`).toLocaleDateString(
                      "ru-RU",
                    )}
                  </strong>
                  <p className="booking-card__text">
                    {formatTimeRange(booking.start, booking.duration)}
                  </p>
                </div>
                <strong className="booking-card__value">
                  {money(booking.total)}
                </strong>
                <CancelBooking
                  confirming={cancelId === booking.id}
                  onAsk={() => setCancelId(booking.id)}
                  onKeep={() => setCancelId(null)}
                  onCancel={() => {
                    if (cancelBooking(booking.id)) setCancelId(null);
                  }}
                />
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <h2>Бронирования не найдены</h2>
            </div>
          )}
        </>
      ) : (
        <section className="user-list" aria-label="Пользователи">
          {accounts.map((a) => (
            <article className="user-card" key={a.id}>
              <div>
                <h2>
                  {a.name}
                  {a.id === user.id ? " (вы)" : ""}
                </h2>
                <p className="meta">{a.email}</p>
              </div>
              <label className="form__field user-card__role">
                Роль
                <select
                  className="form__control"
                  aria-label={`Роль пользователя ${a.email}`}
                  disabled={a.id === user.id}
                  value={a.role}
                  onChange={(e) => {
                    try {
                      updateRole(a.id, e.target.value);
                      setError("");
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </label>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
