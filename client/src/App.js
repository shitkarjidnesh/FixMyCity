// import React, { useContext } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { AuthContext } from "./context/AuthContext";

// import Navbar from "./components/navbar";
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import ReportPage from "./pages/ReportPage";
// import MyComplaintsPage from "./pages/MyComplaintsPage";
// import ProfilePage from "./pages/ProfilePage";
// import ContactPage from "./pages/ContactPage";
// import PrivacyPage from "./pages/PrivacyPage";
// import AboutPage from "./pages/about";
// import Footer from "./components/Footer";

// // A wrapper for routes that require authentication.
// function PrivateRoute({ children }) {
//   const { auth, loading } = useContext(AuthContext);

//   if (loading) return null; // or a loader/spinner

//   return auth.token ? children : <Navigate to="/login" />;
// }

// function App() {
//   const { auth } = useContext(AuthContext);

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//             <main className="flex-grow">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />

//           <Route path="/contact" element={<ContactPage />} />
//           <Route path="/privacy" element={<PrivacyPage />} />
//           <Route path="/about" element={<AboutPage />} />

//           {/* Private Routes */}
//           <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
//           <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
//           <Route path="/my-complaints" element={<PrivateRoute><MyComplaintsPage /></PrivateRoute>} />
//           <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

//           {/* Fallback Route */}
//           <Route path="*" element={<Navigate to={auth.token ? "/" : "/login"} />} />
//         </Routes>
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (otpSent && timer <= 0) {
      alert("OTP expired. Please request a new one.");
      setOtpSent(false);
      setOtp("");
      setTimer(300);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const formatTime = (t) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const requestOtp = async () => {
    if (!email) return alert("Enter your email first");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/otp/request-otp",
        {
          email,
        }
      );
      if (res.data.success) {
        alert("OTP sent to email");
        setOtpSent(true);
        setTimer(300);
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  };

  const verifyAndRegister = async () => {
    if (!name || !email || !password || !otp) {
      return alert("Fill all fields");
    }
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        name,
        email,
        password,
        otp,
      });
      if (res.data.success) {
        alert("Registration successful");
        setName("");
        setEmail("");
        setPassword("");
        setOtp("");
        setOtpSent(false);
        setTimer(300);
      } else {
        alert(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Registration</h2>

      <label>Name</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Email</label>
      <input
        style={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />

      <label>Password</label>
      <input
        style={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {!otpSent ? (
        <button style={styles.button} onClick={requestOtp}>
          Request OTP
        </button>
      ) : (
        <>
          <label>Enter OTP ({formatTime(timer)})</label>
          <input
            style={styles.input}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="number"
          />
          <button style={styles.button} onClick={verifyAndRegister}>
            Register
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default App;
