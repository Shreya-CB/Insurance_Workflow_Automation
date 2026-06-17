import { useState } from "react";
import { API } from "../api";

export default function OtpLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (locked) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await API.post("/auth/send-otp", { phone });
      setMsg(res.data.message);
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error sending OTP";
      setMsg(errorMessage);
      if (errorMessage.toLowerCase().includes("locked")) setLocked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (locked) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await API.post("/auth/verify-otp", { phone, otp });
      localStorage.setItem("token", res.data.token);
      setMsg("✅ Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid OTP";
      setMsg(errorMessage);
      if (errorMessage.toLowerCase().includes("locked")) setLocked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Login via OTP</h2>

      {step === 1 && (
        <>
          <input
            className="border p-2 w-full mb-3"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={handleSendOTP}
            className="bg-blue-500 text-white p-2 rounded w-full"
            disabled={loading || locked}
          >
            {locked ? "🔒 Locked" : loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            className="border p-2 w-full mb-3"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerifyOTP}
            className="bg-green-500 text-white p-2 rounded w-full"
            disabled={loading || locked}
          >
            {locked ? "🔒 Locked" : loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

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