import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
