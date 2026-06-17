import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import OtpLogin from "./pages/OtpLogin";
import Dashboard from "./pages/Dashboard";
import KycUpload from "./pages/KycUpload";
import FamilyPage from "./pages/FamilyPage";
import QuotePage from "./pages/QuotePage";
import MakePaymentPage from "./pages/MakePaymentPage";
import PaymentPage from "./pages/PaymentPage";
import MyPoliciesPage from "./pages/MyPoliciesPage";
import TransactionsPage from "./pages/TransactionsPage";
import ClaimsList from "./pages/ClaimsList";
import Footer from "./data/Footer"; 
import ClaimSubmit from "./pages/ClaimSubmit";

import AdjusterDashboard from "./pages/AdjusterDashboard";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <div>
    <Router>
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={<Landing />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-login" element={<OtpLogin />} />
        <Route path="/kyc" element={<KycUpload />} />
        <Route path="/family" element={<FamilyPage />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/*Quote and Payment Pages*/}
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/make-payment" element={<MakePaymentPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/my-policy" element={<MyPoliciesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />

        {/*Claim Submission Routes*/}
        <Route path="/view-claim" element={<ClaimsList />} />
        <Route path="/submit-claim" element={<ClaimSubmit />} />

        {/*Admin Claim Approval*/}
        <Route path="/adjuster-dashboard" element={<AdjusterDashboard />} />

      </Routes>
    </Router>
    <Footer />
    </div>
  )
}
