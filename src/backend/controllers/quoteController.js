//src/backend/controllers/quoteController.js
import path from "path";
import { fileURLToPath } from "url";

// Helper for current file path (for consistency with other controllers)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route POST /api/quote/payment
 * @desc Receive selected plan details from frontend and prepare for payment
 * @access Protected (JWT token required)
 */
export const policyPayment = async (req, res) => {
  console.log(" [API HIT] /quote/payment");

  try {
    const { plan } = req.body; // Expect { plan: { name, coverage, premium, insuranceType } }
    const userId = req.user?.id;

    // Log for debugging
    //console.log(" User ID:", userId);
    console.log(" Selected Plan:", plan);

    // Validate input
    if (!plan || !plan.name || !plan.premium) {
      console.error("❌ Invalid plan details received:", plan);
      return res.status(400).json({
        success: false,
        message: "Invalid or incomplete plan details",
      });
    }

    // Mock confirmation message
    console.log(` Plan "${plan.name}" under "${plan.insuranceType}" selected by user ${userId}`);

    // Send plan info to frontend (to display on PaymentPage)
    res.status(200).json({
      success: true,
      message: "Plan details ready for payment",
      planDetails: {
        userId,
        name: plan.name,
        insuranceType: plan.insuranceType || "N/A",
        coverage: plan.coverage,
        premium: plan.premium,
        term_years: plan.term_years, // if you want to display "X years"
      },
    });
  } catch (err) {
    console.error(" Error in /quote/payment:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while preparing payment",
      error: err.message,
    });
  }
};
