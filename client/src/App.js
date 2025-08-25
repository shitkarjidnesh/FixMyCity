import React, { useState,useContext } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/navbar";
import Home from "./components/Home";
import "./index.css";
import {  Routes, Route } from "react-router-dom";

import { AuthContext } from "./context/AuthContext";


function App() {
const { user } = useContext(AuthContext); 


  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
