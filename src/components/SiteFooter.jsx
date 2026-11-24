import React from "react";
import { Link } from "react-router-dom";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Link to="/" className="brand">
          myoffice
        </Link>
        <nav className="site-footer__nav" aria-label="Навигация в футере">
          <Link to="/">Каталог</Link>
          <Link to="/bookings">Мои записи</Link>
          <Link to="/profile">Личный кабинет</Link>
        </nav>
      </div>
    </footer>
  );
}
