import React, { useState } from "react";
import { typeLabel } from "../utils/spaceTypes.js";
import { Link, useNavigate } from "react-router-dom";
import { findSpace } from "../database/spaces.js";
import { money, formatDate, formatTimeRange } from "../utils/format.js";
import CancelBooking from "../components/CancelBooking.jsx";
import { useNow } from "../hooks/useNow.js";
import {
  bookingStart,
  isCompleted,
  sortBookings,
} from "../utils/bookingTime.js";
export default function Bookings({ bookings, cancelBooking }) {
  const navigate = useNavigate();
  const now = useNow();
  const [cancelId, setCancelId] = useState(null);
  const [notice, setNotice] = useState("");
  return (
    <>
      <button
        type="button"
        className="back-link"
        onClick={() => {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate("/");
        }}
      >
        Назад
      </button>
      <div className="page-heading">
        <h1>Мои бронирования</h1>
      </div>
      {notice && <p role="status">{notice}</p>}
      {bookings.length ? (
        <div className="booking-list">
          {sortBookings(bookings, now).map((booking) => {
            const space = findSpace(booking.spaceId);
            const completed = isCompleted(booking, now);
            return (
              <article className="booking-card" key={booking.id}>
                <div>
                  <p
                    className={`booking-card__status${completed ? " booking-card__status--completed" : ""}`}
                  >
                    {completed
                      ? "Завершено"
                      : bookingStart(booking) <= now
                        ? "Идёт"
                        : "Предстоит"}
                  </p>
                  <p className="meta booking-card__text">
                    {typeLabel(booking.type)}
                    {booking.seatId != null && ` · № ${booking.seatId}`}
                  </p>
                  <h2 className="booking-card__title">
                    <Link
                      className="booking-card__link"
                      to={`/coworkings/${space.id}`}
                    >
                      {space.name}
                    </Link>
                  </h2>
                  <p className="meta booking-card__text">{space.address}</p>
                </div>
                <div>
                  <strong className="booking-card__value">
                    {formatDate(booking.date)}
                  </strong>
                  <p className="booking-card__text">
                    {formatTimeRange(booking.start, booking.duration)} ·{" "}
                    {booking.duration} ч
                  </p>
                </div>
                <strong className="booking-card__value">
                  {money(booking.total)}
                </strong>
                {!completed && (
                  <CancelBooking
                    confirming={cancelId === booking.id}
                    onAsk={() => setCancelId(booking.id)}
                    onKeep={() => setCancelId(null)}
                    onCancel={() => {
                      if (cancelBooking(booking.id)) {
                        setCancelId(null);
                        setNotice("Бронирование отменено");
                      }
                    }}
                  />
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Нет бронирований</h2>
          <Link className="button" to="/">
            Открыть каталог
          </Link>
        </div>
      )}
    </>
  );
}
