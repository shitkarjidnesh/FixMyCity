// AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, role: null, name: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    const role = localStorage.getItem("adminrole"); // ✅ read saved role
    const name = localStorage.getItem("adminname"); // optional if you store

    if (token && role) {
      setAuth({ token, role, name });
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    setAuth({ token: data.token, role: data.role, name: data.name });

    localStorage.setItem("admintoken", data.token);
    localStorage.setItem("adminrole", data.role); // ✅
    localStorage.setItem("adminname", data.name); // optional
  };

  const logout = () => {
    setAuth({ token: null, role: null, name: null });

    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminrole"); // ✅
    localStorage.removeItem("adminname"); // optional
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
