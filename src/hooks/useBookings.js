import { useEffect, useState } from "react";
import {
  storageKey,
  readBookings,
  writeBookings,
} from "../database/bookings.js";

function loadBookings() {
  try {
    return { bookings: readBookings(), error: "" };
  } catch (error) {
    return {
      bookings: [],
      error: error.message || "Не удалось прочитать бронирования из браузера",
    };
  }
}

export function useBookings() {
  const [state, setState] = useState(loadBookings);
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    const refresh = (event) => {
      if (event.key === storageKey || event.key === null) {
        setState(loadBookings());
        setSaveError("");
      }
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function save(next) {
    try {
      // Не затираем список, если другая вкладка успела изменить данные.
      const current = readBookings();
      if (JSON.stringify(current) !== JSON.stringify(state.bookings)) {
        setState({ bookings: current, error: "" });
        setSaveError(
          "Бронирования изменились в другой вкладке. Проверьте занятость и повторите действие.",
        );
        return false;
      }
      writeBookings(next);
      setState({ bookings: next, error: "" });
      setSaveError("");
      return true;
    } catch (error) {
      setSaveError(
        `Не удалось сохранить бронирования. ${error.message || "Разрешите хранилище браузера и повторите действие."}`,
      );
      return false;
    }
  }
  return {
    bookings: state.bookings,
    save,
    storageError: state.error || saveError,
    storageReady: !state.error,
  };
}
