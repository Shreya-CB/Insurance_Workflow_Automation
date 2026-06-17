import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import "../styles/auth.css";


export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegisterInit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register-init", form);
      setMsg(res.data.message);
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await API.post("/auth/register-verify", { phone: form.phone, otp });
      setMsg(res.data.message);
      if (res.data.message.includes("successfully")) {
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>

      {step === 1 && (
        <form onSubmit={handleRegisterInit} className="flex flex-col gap-3">
          <input name="name" placeholder="Full Name" onChange={handleChange} required className="auth-input" />
          <input name="email" placeholder="Email" onChange={handleChange} required className="auth-input" />
          <input name="phone" placeholder="Phone" onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="auth-input" />
          <button className="auth-button">Register</button>
        </form>
      )}

      {step === 2 && (
        <div className="auth-card">
          <p className="text-gray-700">Enter OTP sent to {form.phone}</p>
          <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="auth-input" />
          <button onClick={handleVerifyOTP} className="auth-button">
            Verify OTP
          </button>
        </div>
      )}

      <p className="mt-3 text-sm text-center text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 underline">
          Login here
        </Link>
      </p>

      <p className="mt-3 text-green-600 text-center">{msg}</p>
    </div>
  );
}
