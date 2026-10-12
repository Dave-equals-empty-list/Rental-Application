import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./useAuth";
import { apiGet, ApiError } from "../api/client";

const STORAGE_KEY = "ig.user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Demo login. The backend has no auth endpoint and stores no passwords,
 * so this matches the email against GET /api/users and nothing else.
 * When a real POST /api/auth/login exists, only `login` needs to change.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, { remember = true } = {}) => {
    const users = await apiGet("/api/users");
    const wanted = email.trim().toLowerCase();
    const found = users.find((u) => u.email?.toLowerCase() === wanted);
    if (!found) throw new ApiError("No account", { code: "NOT_FOUND" });

    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(found));
    setUser(found);
    return found;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
