//using tailwind css
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, FileCheck, CreditCard, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex flex-col font-poppins">

      <header className="flex justify-between items-center px-10 py-5 backdrop-blur-md bg-white/40 shadow-sm">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl font-bold text-blue-700"
        >
          InsuraEase
        </motion.h1>

        <nav className="flex gap-6 text-blue-800 font-medium">
          <Link to="/login" className="hover:text-blue-500 transition">Login</Link>
          <Link to="/register" className="hover:text-blue-500 transition">Register</Link>
        </nav>
      </header>

      <main className="flex flex-col lg:flex-row items-center justify-between flex-1 px-10 lg:px-20 py-10">

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-center lg:text-left space-y-6"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-blue-900 leading-tight">
            Secure, Smart & Seamless <br /> Insurance Automation
          </h2>
          <p className="text-gray-700 text-lg">
            Manage your policies, payments, and claims effortlessly — all in one
            secure dashboard.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="border-2 border-blue-500 text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Create Account
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 lg:mt-0"
        >
          <img
            src="/insurance_illustration.jpg"
            alt="Insurance Illustration"
            className="w-[380px] lg:w-[450px]"
          />

        </motion.div>
      </main>

      <section className="py-16 bg-white text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-10">Why Choose InsuraEase?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-10 lg:px-20">
          <FeatureCard
            Icon={ShieldCheck}
            title="Secure Access"
            desc="Your data is encrypted and safe with multi-layer authentication."
          />
          <FeatureCard
            Icon={FileCheck}
            title="Fast KYC"
            desc="Upload and verify your identity in just a few minutes."
          />
          <FeatureCard
            Icon={CreditCard}
            title="Quick Payments"
            desc="Pay premiums instantly through cards, UPI, or net banking."
          />
          <FeatureCard
            Icon={BarChart3}
            title="Smart Dashboard"
            desc="Get real-time insights into your active policies and claims."
          />
        </div>
      </section>

      <footer className="bg-blue-900 text-white text-center py-4 text-sm">
        © {new Date().getFullYear()} InsuraEase — Empowering Digital Insurance
      </footer>
    </div>
  );
}

function FeatureCard({ Icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-md p-6 flex flex-col items-center text-center"
    >
      <Icon className="w-12 h-12 text-blue-600 mb-4" />
      <h4 className="text-lg font-semibold text-blue-800 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{desc}</p>
    </motion.div>
  );
}
