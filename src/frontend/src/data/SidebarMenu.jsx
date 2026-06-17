// src/components/SidebarMenu.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/SidebarMenu.css";
import { Menu, Home, FileText, CreditCard, LogOut } from "lucide-react";

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="menu-icon" onClick={toggleMenu}>
        <Menu size={26} />
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className="sidebar-link">
          <Home size={18} /> <span>Dashboard</span>
        </Link>

        <Link to="/family" className="sidebar-link">
          <FileText size={18} /> <span>Family Data</span>
        </Link>

        <Link to="/kyc" className="sidebar-link">
          <FileText size={18} /> <span>KYC Uploads</span>
        </Link>

        <Link to="/quote" className="sidebar-link">
          <FileText size={18} /> <span>Buy Policy</span>
        </Link>

        <Link to="/make-payment" className="sidebar-link">
          <FileText size={18} /> <span>Make Payments</span>
        </Link>

        <Link to="/my-policy" className="sidebar-link">
          <FileText size={18} /> <span>My Policies</span>
        </Link>

        <Link to="/transactions" className="sidebar-link">
          <CreditCard size={18} /> <span>My Transactions</span>
        </Link>

        <Link to="/submit-claim" className="sidebar-link">
          <CreditCard size={18} /> <span>Submit Claim</span>
        </Link>

        <Link to="/view-claim" className="sidebar-link">
          <CreditCard size={18} /> <span>View My Claims</span>
        </Link>

        <Link to="/help" className="sidebar-link">
          <FileText size={18} /> <span>Help</span>
        </Link>

        <Link to="/login" className="sidebar-link logout">
          <LogOut size={18} /> <span>Logout</span>
        </Link>
      </nav>
    </div>
  );
}
