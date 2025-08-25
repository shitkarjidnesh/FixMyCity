// AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, role: null, name: null });

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
  }, []);

  const login = (data) => {
    setAuth({ token: data.token, role: data.role, name: data.name });
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setAuth({ token: null, role: null, name: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
