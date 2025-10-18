// AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    role: null,
    name: null,
    userId: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
    setLoading(false); // finished loading from localStorage
  }, []);

  const login = (data) => {
    setAuth({
      token: data.token,
      role: data.role,
      name: data.name,
      userId: data.userId,
    });
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: data.token,
        role: data.role,
        name: data.name,
        userId: data.userId,
      })
    );
  };

  const logout = () => {
    setAuth({ token: null, role: null, name: null, userId: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
