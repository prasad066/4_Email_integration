const crypto = require("crypto");

const generateOTP = () => {
  return String(crypto.randomInt(100000, 1000000));
};

const hashOTP = (otp) => {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is missing from .env");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
};

module.exports = {
  generateOTP,
  hashOTP,
};