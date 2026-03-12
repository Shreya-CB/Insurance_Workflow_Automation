//src/frontend/src/pages/QuotePage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import insurancePlans from "../data/insurancePlans";
import "../styles/QuotePage.css";
import SidebarMenu from "../data/SidebarMenu";
import { useNavigate } from "react-router-dom";
//import { API } from "../api";


import termIcon from "../images/term.png";
import vehicleIcon from "../images/vehicle.png";
import healthIcon from "../images/health.png";
import homeIcon from "../images/home.png";
import lifeIcon from "../images/life.png";
import pensionIcon from "../images/pension.png";

export default function QuotePage() {
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { key: "term", label: "Term Insurance", image: termIcon },
    { key: "vehicle", label: "Vehicle Insurance", image: vehicleIcon },
    { key: "health", label: "Health Insurance", image: healthIcon },
    { key: "home", label: "Home Insurance", image: homeIcon },
    { key: "life", label: "Life Insurance", image: lifeIcon },
    { key: "pension", label: "Pension Insurance", image: pensionIcon },
  ];

  const handleBuyPlan = async (plan) => {
    setLoading(true); // Start loading
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/quote/payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            plan: {
            name: plan.name,
            insuranceType: plan.id,      // from insurancePlans.js (term, life, etc.)
            coverage: plan.coverage,
            premium: plan.premium,
            term_years: plan.term_years, // newly added
            },
        }),
        });

        const data = await response.json();

        if (data.success) {
        console.log("✅ Plan details sent to backend:", data.planDetails);
        navigate("/payment", { state: { plan: data.planDetails } });
        } else {
        console.error("❌ Backend error:", data.message);
        alert("Error preparing payment. Please try again.");
        }
    } catch (err) {
        console.error("Error sending plan details:", err);
        alert("Server error while sending plan details.");
    } finally {
        setLoading(false); // Stop loading regardless of success or failure
    }
  };
  /*const handleBuyPlan = async (plan) => {
    setLoading(true); // Start loading
    try {
        const token = localStorage.getItem("token");
        const response = await API.post("/quote/payment", {
        plan: {
            name: plan.name,
            insuranceType: plan.id,
            coverage: plan.coverage,
            premium: plan.premium,
            term_years: plan.term_years,
        },
    });
        const data = await response.json();

        if (data.success) {
        console.log("✅ Plan details sent to backend:", data.planDetails);
        navigate("/payment", { state: { plan: data.planDetails } });
        } else {
        console.error("❌ Backend error:", data.message);
        alert("Error preparing payment. Please try again.");
        }
    } catch (err) {
        console.error("Error sending plan details:", err);
        alert("Server error while sending plan details.");
    } finally {
        setLoading(false); // Stop loading regardless of success or failure
    }
  };*/

  return (
    <div>
    <SidebarMenu />
    <div className="quote-page">
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 font-poppins">
        <main className="flex-grow">
            <div className="quote-container">
            <motion.h2
                className="title"
                initial={{ opacity: 0, y: -60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                WHAT INSURANCE ARE YOU LOOKING FOR?
            </motion.h2>

            {/* Category Cards */}
            <motion.div
                className="category-row"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y:0 }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
            >
                {categories.map((cat, index) => (
                <motion.div
                    key={cat.key}
                    className={`category-card ${
                    selectedType === cat.key ? "active" : ""
                    }`}
                    onClick={() => setSelectedType(cat.key)}
                    whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <img src={cat.image} alt={cat.label} className="category-img" />
                    <p>{cat.label}</p>
                </motion.div>
                ))}
            </motion.div>

            {/* Display Plans for Selected Type */}
            {selectedType && (
                <motion.div
                key={selectedType}
                className="plans-section"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y:0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                >
                <h3 className="plans-heading">
                    Available {categories.find((c) => c.key === selectedType)?.label} Plans
                </h3>
                <div className="plans-grid">
                    {insurancePlans[selectedType].map((plan, i) => (
                    <motion.div
                        className="plan-card"
                        key={plan.id}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * i }}
                    >
                        <h4>{plan.name}</h4>
                        <p>Coverage: ₹{plan.coverage.toLocaleString()}</p>
                        <p>Premium: ₹{plan.premium.toLocaleString()} / year</p>
                        <p>Term years: {plan.term_years} years</p>
                        <ul>
                        {plan.benefits.map((b, idx) => (
                            <li key={idx}>✔ {b}</li>
                        ))}
                        </ul>
                        <button className="buy-btn" onClick={() => handleBuyPlan(plan)}>
                        Buy Plan
                        </button>
                    </motion.div>
                    ))}
                </div>
                </motion.div>
            )}

            {loading && (
                <div className="text-center text-blue-600 font-semibold mt-4">
                    Preparing For payment... Please wait ⏳
                </div>
            )}

            </div>
        </main>
    </div>
    </div>
    </div>
  );
}
