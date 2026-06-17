// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import  paymentRoutes from "./routes/paymentRoutes.js";
import  quoteRoutes from "./routes/quoteRoutes.js";
import  makePaymentRoutes from "./routes/makePaymentRoutes.js";
import  policiesRoutes from "./routes/policiesRoutes.js";
import  transactionsRoutes from "./routes/transactionsRoutes.js";
import claims  from "./routes/claims.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

// 👇 Apply JSON parser only to non-file routes
app.use("/api/auth", express.json(), authRoutes);
app.use("/api/family", express.json(), familyRoutes);

// ⚠️ DO NOT use express.json() before multer upload route
app.use("/api/kyc", kycRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/payment",express.json(), paymentRoutes);
app.use("/api/quote",express.json(), quoteRoutes);
app.use("/api/make-payment",express.json(), makePaymentRoutes);
app.use("/api/policies",express.json(), policiesRoutes);
app.use("/api/transactions",express.json(), transactionsRoutes);

app.use("/api/claims", claims);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
