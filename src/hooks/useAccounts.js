import { useEffect, useState } from "react";
import {
  accountsKey,
  sessionKey,
  readAccounts,
  changeRole,
} from "../database/accounts.js";

function loadAccounts() {
  try {
    return { accounts: readAccounts(), error: "" };
  } catch {
    return {
      accounts: [],
      error:
        "Не удалось прочитать аккаунты. Проверьте данные и доступ к хранилищу браузера.",
    };
  }
}

export function useAccounts() {
  const [{ accounts, error: accountError }, setAccountState] =
    useState(loadAccounts);
  const [session, setSession] = useState(() => {
    try {
      return sessionStorage.getItem(sessionKey);
    } catch {
      return null;
    }
  });
  const user = accounts.find((account) => account.id === session);
  useEffect(() => {
    function refresh(event) {
      if (event.key === accountsKey || event.key === null) {
        setAccountState(loadAccounts());
      }
    }
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  function authenticate(account) {
    const next = readAccounts();
    sessionStorage.setItem(sessionKey, account.id);
    setAccountState({ accounts: next, error: "" });
    setSession(account.id);
  }
  function logout() {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      setAccountState((previous) => ({
        ...previous,
        error:
          "Браузер не разрешил очистить сохранённый вход. Закройте вкладку.",
      }));
    } finally {
      setSession(null);
    }
  }
  function updateRole(id, role) {
    const next = changeRole(readAccounts(), id, role, user?.id);
    localStorage.setItem(accountsKey, JSON.stringify(next));
    setAccountState({ accounts: next, error: "" });
  }
  return { user, accounts, authenticate, logout, updateRole, accountError };
}
