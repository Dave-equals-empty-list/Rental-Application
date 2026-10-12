import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Where each role lands after logging in
export const HOME_BY_ROLE = {
  Tenant: "/properties",
  Landlord: "/applications",
  Agent: "/applications",
  Admin: "/applications",
};
