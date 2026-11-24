import React from "react";

export default function CancelBooking({ confirming, onAsk, onKeep, onCancel }) {
  if (!confirming) {
    return (
      <button
        type="button"
        className="button button--text booking-card__action"
        onClick={onAsk}
      >
        Отменить
      </button>
    );
  }

  return (
    <div className="cancel-confirmation">
      <span className="cancel-confirmation__question">
        Отменить бронирование?
      </span>
      <button
        type="button"
        className="button button--secondary booking-card__action"
        onClick={onCancel}
      >
        Да, отменить
      </button>
      <button
        type="button"
        className="button button--text booking-card__action"
        onClick={onKeep}
      >
        Оставить
      </button>
    </div>
  );
}
