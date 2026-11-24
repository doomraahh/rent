import React, { useEffect, useRef, useState } from "react";
import { formatDate, localDate } from "../utils/format.js";

const parse = (value) => new Date(`${value}T12:00:00`);
export default function DatePicker({ value, min, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => parse(value || min));
  const root = useRef(null);
  const trigger = useRef(null);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const selectedDay = root.current.querySelector(
      '[aria-pressed="true"]:not(:disabled)',
    );
    const firstDay = root.current.querySelector(
      ".date-picker__day:not(:disabled)",
    );
    (selectedDay ?? firstDay)?.focus();
  }, [open, month]);
  const year = month.getFullYear();
  const index = month.getMonth();
  const count = new Date(year, index + 1, 0).getDate();
  const offset = (new Date(year, index, 1).getDay() + 6) % 7;
  const title = month.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  const previous = new Date(year, index - 1, 1, 12);
  const canPrevious = localDate(new Date(year, index, 0, 12)) >= min;
  function keyboard(event, day) {
    const shift = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
      event.key
    ];
    if (shift == null) return;
    event.preventDefault();
    root.current
      ?.querySelector(`[data-day="${day + shift}"]:not(:disabled)`)
      ?.focus();
  }
  return (
    <div
      className="date-picker"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="form__control date-picker__trigger"
        aria-label="Дата"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setMonth(parse(value || min));
          setOpen(!open);
        }}
      >
        <span>
          {value
            ? parse(value).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Выберите дату"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 2v6m10-6v6M3 11h18" />
        </svg>
      </button>
      {open && (
        <div
          className="date-picker__panel"
          role="dialog"
          aria-label="Выбор даты"
        >
          <div className="date-picker__header">
            <button
              type="button"
              aria-label="Предыдущий месяц"
              disabled={!canPrevious}
              onClick={() => setMonth(previous)}
            >
              ‹
            </button>
            <strong aria-live="polite">{title}</strong>
            <button
              type="button"
              aria-label="Следующий месяц"
              onClick={() => setMonth(new Date(year, index + 1, 1, 12))}
            >
              ›
            </button>
          </div>
          <div className="date-picker__grid" role="group" aria-label={title}>
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <span className="date-picker__weekday" key={day}>
                {day}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: count }, (_, i) => i + 1).map((day) => {
              const date = localDate(new Date(year, index, day, 12));
              return (
                <button
                  key={day}
                  data-day={day}
                  type="button"
                  className="date-picker__day"
                  disabled={date < min}
                  aria-pressed={date === value}
                  aria-current={date === localDate() ? "date" : undefined}
                  aria-label={formatDate(date)}
                  onKeyDown={(e) => keyboard(e, day)}
                  onClick={() => {
                    onChange(date);
                    close();
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
