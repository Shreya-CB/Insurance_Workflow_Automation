import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white text-center py-4 text-sm">
      © {new Date().getFullYear()} InsuraEase — Empowering Digital Insurance
    </footer>
  );
}
