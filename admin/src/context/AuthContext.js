// AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, role: null, name: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This part is more complex now. For simplicity, we'll assume
    // that on refresh, only the token is needed. The name/role
    // would be lost until the next login or a /me API call.
    const token = localStorage.getItem("admintoken"); // <-- Read 'token'
    if (token) {
      // For this simple case, we just restore the token.
      // A full app might decode the token here or fetch user data.
      setAuth({ token: token, role: "admin", name: null }); // Role can be decoded from token if needed
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    // Keep the full user object in the component's state
    setAuth({ token: data.token, role: data.role, name: data.name });

    // BUT, only store the token string in localStorage
    localStorage.setItem("admintoken", data.token); // <-- Store only the token
  };

  const logout = () => {
    setAuth({ token: null, role: null, name: null });
    localStorage.removeItem("admintoken"); // <-- Remove 'token'
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
