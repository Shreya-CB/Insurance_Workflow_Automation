const otpStore = new Map(); // In-memory store: phone → { otp, expiry }

export const generateOTP = (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiry: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
  return otp;
};

export const verifyOTP = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (record.expiry < Date.now()) return false;
  return record.otp === otp;
};

export const clearOTP = (phone) => {
  otpStore.delete(phone);
};
