export const accountsKey = "coworking.accounts.v1";
export const sessionKey = "coworking.session.v1";

const demoAccounts = [
  {
    id: "demo-admin",
    name: "Администратор",
    email: "admin@coworking.test",
    role: "admin",
    salt: "coworking-demo-admin-v1",
    hash: "527b14ccc53b29d0f34f84c11a06ccbe831613dc1393a9cbccfe14b7f43176e2",
  },
  {
    id: "demo-user",
    name: "Демо-пользователь",
    email: "user@coworking.test",
    role: "user",
    salt: "coworking-demo-user-v1",
    hash: "48b4751a58239126ee538031e80fb8e2654e6e153b982ba44f2d7007fcf249e4",
  },
];

export function readAccounts(storage = localStorage) {
  const raw = storage.getItem(accountsKey);
  const accounts = raw ? JSON.parse(raw) : [];
  if (
    !Array.isArray(accounts) ||
    accounts.some(
      (a) =>
        !a ||
        typeof a.id !== "string" ||
        typeof a.email !== "string" ||
        typeof a.name !== "string" ||
        !["admin", "user"].includes(a.role) ||
        typeof a.hash !== "string" ||
        typeof a.salt !== "string",
    )
  )
    throw new Error(
      "Данные аккаунтов повреждены. Восстановите данные браузера.",
    );
  const missing = demoAccounts.filter(
    (demo) => !accounts.some((a) => a.id === demo.id || a.email === demo.email),
  );
  if (!missing.length) return accounts;
  const next = [...accounts, ...missing];
  storage.setItem(accountsKey, JSON.stringify(next));
  return next;
}

export function validateRegistration({
  name,
  lastName,
  email,
  password,
  confirm,
}) {
  if (!name.trim() || name.trim().length > 80)
    return "Укажите имя длиной до 80 символов";
  if (
    typeof lastName !== "string" ||
    !lastName.trim() ||
    lastName.trim().length > 80
  )
    return "Укажите фамилию длиной до 80 символов";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 254
  )
    return "Укажите корректный email";
  if (password.length < 8 || password.length > 128)
    return "Пароль должен содержать от 8 до 128 символов";
  if (password !== confirm) return "Пароли не совпадают";
  return "";
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 210000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export async function registerAccount(input, storage = localStorage) {
  const error = validateRegistration(input);
  if (error) throw new Error(error);
  const email = input.email.trim().toLowerCase();
  const firstName = input.name.trim();
  const lastName = input.lastName.trim();
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const hash = await passwordHash(input.password, salt);
  const accounts = readAccounts(storage);
  if (accounts.some((a) => a.email === email))
    throw new Error("Этот email уже зарегистрирован");
  const account = {
    id: crypto.randomUUID(),
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email,
    role: "user",
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };
  storage.setItem(accountsKey, JSON.stringify([...accounts, account]));
  return account;
}

export async function loginAccount(email, password, storage = localStorage) {
  const account = readAccounts(storage).find(
    (a) => a.email === email.trim().toLowerCase(),
  );
  if (!account || (await passwordHash(password, account.salt)) !== account.hash)
    throw new Error("Неверный email или пароль");
  return account;
}

export function changeRole(accounts, id, role, actorId) {
  if (accounts.find((a) => a.id === actorId)?.role !== "admin")
    throw new Error("Доступ только для администратора");
  if (!["admin", "user"].includes(role)) throw new Error("Неизвестная роль");
  const target = accounts.find((a) => a.id === id);
  if (!target) throw new Error("Пользователь не найден");
  if (id === actorId && role !== "admin")
    throw new Error("Нельзя снять с себя права администратора");
  return accounts.map((a) => (a.id === id ? { ...a, role } : a));
}
