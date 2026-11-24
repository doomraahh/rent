import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cities } from "../database/cities.js";
export default function SiteHeader({
  user,
  city,
  changeCity,
  theme,
  setTheme,
}) {
  const navigate = useNavigate();
  const isDark = theme === "dark";
  return (
    <header className="site-header">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Перейти к содержимому
      </a>
      <div className="site-header__inner">
        <Link to="/" className="brand">
          myoffice
        </Link>
        <label className="site-header__city">
          <img src="/icons/map-pin.svg" alt="" width="15" height="20" />
          <select
            className="form__control dropdown"
            aria-label="Выберите город"
            value={city.id}
            onChange={(e) => {
              changeCity(e.target.value);
              navigate("/");
            }}
          >
            {cities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <nav className="navigation" aria-label="Основная навигация">
          <NavLink to="/" end className="navigation__link">
            Каталог
          </NavLink>
          <NavLink to="/bookings" className="navigation__link">
            Мои записи
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="navigation__link">
              Админ-панель
            </NavLink>
          )}
          {user ? (
            <NavLink to="/profile" className="navigation__link">
              Профиль
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="navigation__link navigation__link--login"
            >
              Войти
            </NavLink>
          )}
          <button
            type="button"
            className="theme-switch"
            aria-label="Тёмная тема"
            aria-pressed={isDark}
            title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <svg
              width="40"
              height="20"
              viewBox="0 0 40 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <g className="theme-switch__sun">
                <circle cx="10" cy="10" r="3.5" />
                <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4m-8.6 8.6-1.4 1.4" />
              </g>
              <path
                className="theme-switch__moon"
                d="M30 3a7 7 0 1 0 7 7 5.5 5.5 0 0 1-7-7Z"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
