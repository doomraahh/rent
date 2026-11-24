import React from "react";
import { Link } from "react-router-dom";
export default function Profile({ user, logout }) {
  return (
    <section className="auth-panel">
      <h1>Профиль</h1>
      <dl className="profile-details">
        <div>
          <dt>Имя</dt>
          <dd>{user.firstName || user.name}</dd>
        </div>
        <div>
          <dt>Фамилия</dt>
          <dd>{user.lastName || "Не указана"}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
      <div className="profile-actions">
        <Link className="button" to="/bookings">
          Мои записи
        </Link>
        <button
          type="button"
          className="button button--secondary"
          onClick={logout}
        >
          Выйти из аккаунта
        </button>
      </div>
    </section>
  );
}
