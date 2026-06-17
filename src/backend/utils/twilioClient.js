// utils/twilioClient.js
// import twilio from "twilio";
// export const client = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN");

// utils/twilioClient.js
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
