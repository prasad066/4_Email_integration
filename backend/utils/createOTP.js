const OTP = require("../models/otpModel");
const { generateOTP, hashOTP } = require("./otp");

const createOTP = async (userId) => {
  const otp = generateOTP();

  const otpHash = hashOTP(otp);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.deleteMany({ userId });

  await OTP.create({
    userId,
    otpHash,
    expiresAt,
  });

  return otp;
};

module.exports = createOTP;