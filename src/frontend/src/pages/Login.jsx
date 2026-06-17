import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [mode, setMode] = useState("email"); // "email" or "otp"
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });
  const [msg, setMsg] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---- EMAIL LOGIN ----
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      //localStorage.setItem("token", res.data.token);
      setMsg("✅ Login successful! Redirecting...");
      setTimeout(() => {
        if (role === "admin") {
          navigate("/adjuster-dashboard");  // Staff landing page
        } else {
          navigate("/dashboard");           // User landing page
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "⚠️ Login failed.";
      setMsg(errorMessage);

      // Detect lockout
      if (errorMessage.toLowerCase().includes("locked")) setLocked(true);
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP LOGIN (Step 1: Send OTP) ----
  const handleSendOTP = async () => {
    if (locked) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await API.post("/auth/send-otp", { phone: form.phone });
      setMsg(res.data.message);
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "⚠️ Failed to send OTP";
      setMsg(errorMessage);
      if (errorMessage.toLowerCase().includes("locked")) setLocked(true);
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP LOGIN (Step 2: Verify OTP) ----
  const handleVerifyOTP = async () => {
    if (locked) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await API.post("/auth/verify-otp", {
        phone: form.phone,
        otp: form.otp,
      });
      localStorage.setItem("token", res.data.token);
      setMsg("✅ Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "⚠️ Invalid OTP";
      setMsg(errorMessage);
      if (errorMessage.toLowerCase().includes("locked")) setLocked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>

      {/* --- Mode Toggle --- */}
      <div className="auth-card flex justify-center gap-2 mb-4">
        <button
          className={`toggle-btn ${mode === "email" ? "active" : "inactive"}`}
          onClick={() => {
            setMode("email");
            setMsg("");
            setLocked(false);
          }}
        >
          Email Login
        </button>
        <button
          className={`toggle-btn ${mode === "otp" ? "active" : "inactive"}`}
          onClick={() => {
            setMode("otp");
            setMsg("");
            setLocked(false);
          }}
        >
          OTP Login
        </button>
      </div>

      {/* --- Email Login Form --- */}
      {mode === "email" && (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <button
            type="submit"
            className="auth-button"
            disabled={loading || locked}
          >
            {locked
              ? "🔒 Account Locked"
              : loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      )}

      {/* --- OTP Login Form --- */}
      {mode === "otp" && (
        <div className="auth-card">
          {step === 1 && (
            <>
              <input
                name="phone"
                placeholder="Enter Phone Number"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <button
                onClick={handleSendOTP}
                className="auth-button"
                disabled={loading || locked}
              >
                {locked
                  ? "🔒 Account Locked"
                  : loading
                  ? "Sending..."
                  : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <button
                onClick={handleVerifyOTP}
                className="auth-button"
                disabled={loading || locked}
              >
                {locked
                  ? "🔒 Locked"
                  : loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
            </>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-center text-gray-700">
        New user?{" "}
        <Link to="/register" className="text-blue-500 underline">
          Register here
        </Link>
      </p>

      {/* Message Display */}
      <p
        className={`mt-3 text-center ${
          msg.includes("✅") ? "text-green-600" : "text-red-500"
        }`}
      >
        {msg}
      </p>
    </div>
  );
}