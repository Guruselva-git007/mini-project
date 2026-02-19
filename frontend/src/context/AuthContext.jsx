import { createContext, useContext, useMemo, useState } from "react";
import { clearAuthState, loadAuthState, saveAuthState } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadAuthState);

  const login = ({ token, user }) => {
    const next = { token, user };
    setAuth(next);
    saveAuthState(next);
  };

  const logout = () => {
    const next = { token: null, user: null };
    setAuth(next);
    clearAuthState();
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      login,
      logout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
