import React, { useEffect, useState } from "react";
import { getCity } from "./database/cities.js";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useAccounts } from "./hooks/useAccounts.js";
import { useBookings } from "./hooks/useBookings.js";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Catalog from "./pages/Catalog.jsx";
import SpaceDetail from "./pages/SpaceDetail.jsx";
import Bookings from "./pages/Bookings.jsx";
import Auth from "./pages/Auth.jsx";
import Admin from "./pages/Admin.jsx";
import Profile from "./pages/Profile.jsx";
export default function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const onPointer = () => root.setAttribute("data-pointer-focus", "");
    const onKeyboard = () => root.removeAttribute("data-pointer-focus");
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKeyboard, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKeyboard, true);
      onKeyboard();
    };
  }, []);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("coworking.theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("coworking.theme", theme);
    } catch {
      // Тема уже применена к текущей странице.
    }
  }, [theme]);
  const [cityId, setCityId] = useState(() => {
    try {
      return getCity(localStorage.getItem("coworking.city")).id;
    } catch {
      return "vladivostok";
    }
  });
  const [cityError, setCityError] = useState("");
  const city = getCity(cityId);
  function changeCity(id) {
    const nextCityId = getCity(id).id;
    setCityId(nextCityId);
    try {
      localStorage.setItem("coworking.city", nextCityId);
      setCityError("");
    } catch {
      setCityError("Город выбран, но браузер не разрешил сохранить выбор");
    }
  }
  const { user, accounts, authenticate, logout, updateRole, accountError } =
    useAccounts();
  const { bookings, save, storageError, storageReady } = useBookings();

  function cancelBooking(id) {
    return save(bookings.filter((booking) => booking.id !== id));
  }

  return (
    <>
      <SiteHeader
        user={user}
        city={city}
        changeCity={changeCity}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="page" id="main-content" tabIndex={-1}>
        {accountError && (
          <p role="alert" className="alert">
            {accountError}
          </p>
        )}
        {cityError && (
          <p role="status" className="alert">
            {cityError}
          </p>
        )}
        {storageError && (
          <p role="alert" className="alert">
            {storageError}
          </p>
        )}
        <Routes>
          <Route
            path="/profile"
            element={
              user ? (
                <Profile user={user} logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Catalog key={city.id} city={city} />} />
          <Route
            path="/coworkings/:id"
            element={
              <SpaceDetail
                storageReady={storageReady}
                key={`${location.pathname}${location.search}-${user?.id || "guest"}`}
                user={user}
                bookings={bookings}
                save={save}
              />
            }
          />
          <Route
            path="/bookings"
            element={
              user ? (
                <Bookings
                  bookings={bookings.filter(
                    (booking) => booking.userId === user.id,
                  )}
                  cancelBooking={cancelBooking}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={<Auth user={user} authenticate={authenticate} />}
          />
          <Route
            path="/register"
            element={
              <Auth
                key="register"
                user={user}
                authenticate={authenticate}
                register
              />
            }
          />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <Admin
                  user={user}
                  accounts={accounts}
                  updateRole={updateRole}
                  bookings={bookings}
                  cancelBooking={cancelBooking}
                />
              ) : user ? (
                <div className="empty-state">
                  <h1>Доступ только для администратора</h1>
                  <Link to="/">В каталог</Link>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>Страница не найдена</h1>
                <Link to="/">Вернуться в каталог</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}
