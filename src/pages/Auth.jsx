import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { registerAccount, loginAccount } from "../database/accounts.js";
export default function Auth({ user, authenticate, register = false }) {
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const from = location.state?.from;
  const next =
    typeof from === "string" && /^\/coworkings\/[a-z0-9-]+(?:\?.*)?$/.test(from)
      ? from
      : "/bookings";
  if (user)
    return (
      <Navigate to={next} state={{ draft: location.state?.draft }} replace />
    );
  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      authenticate(
        register
          ? await registerAccount(form)
          : await loginAccount(form.email, form.password),
      );
    } catch (e) {
      setError(
        e.message || "Не удалось войти. Проверьте доступ к хранилищу браузера.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-panel">
      <h1>{register ? "Регистрация" : "Вход"}</h1>
      <form className="auth-panel__form" onSubmit={submit}>
        {register && (
          <>
            <label className="form__field">
              Имя
              <input
                disabled={busy}
                className="form__control"
                required
                name="name"
                autoComplete="given-name"
                maxLength={80}
                value={form.name}
                onChange={update}
              />
            </label>
            <label className="form__field">
              Фамилия
              <input
                disabled={busy}
                className="form__control"
                required
                name="lastName"
                autoComplete="family-name"
                maxLength={80}
                value={form.lastName}
                onChange={update}
              />
            </label>
          </>
        )}
        <label className="form__field">
          Email
          <input
            disabled={busy}
            className="form__control"
            required
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            value={form.email}
            onChange={update}
          />
        </label>
        <label className="form__field">
          Пароль
          <input
            disabled={busy}
            className="form__control"
            required
            type="password"
            name="password"
            autoComplete={register ? "new-password" : "current-password"}
            minLength={register ? 8 : undefined}
            maxLength={128}
            value={form.password}
            onChange={update}
          />
        </label>
        {register && (
          <label className="form__field">
            Повторите пароль
            <input
              disabled={busy}
              className="form__control"
              required
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={form.confirm}
              onChange={update}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={busy} type="submit">
          {busy ? "Подождите…" : register ? "Создать аккаунт" : "Войти"}
        </button>
      </form>
      <p className="auth-panel__switch">
        <Link
          className="auth-panel__link"
          to={register ? "/login" : "/register"}
          state={location.state}
        >
          {register ? "Войти" : "Зарегистрироваться"}
        </Link>
      </p>
    </section>
  );
}
