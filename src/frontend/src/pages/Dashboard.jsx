// src/pages/Dashboard.jsx
import React from "react";
import SidebarMenu from "../data/SidebarMenu";
import "../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <SidebarMenu />

      <div className="dashboard-content">
        <h2 className="font-bold text-2xl mb-2">Welcome to your Insurance Dashboard!</h2>
        <p className="text-gray-600">
          Manage your policies, upload KYC, and add family members — all in one place.
        </p>
      </div>
    </div>
  );
}
