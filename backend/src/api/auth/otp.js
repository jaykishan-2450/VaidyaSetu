/* {
POST: /api/v1/auth/otps  {email in the body}

} */

const { OtpModel } = require("../../model/otp-schema");
const { sendOtpMail } = require("./email-helper");
const bcrypt = require("bcryptjs");
const express = require("express");

const otpRouter = express.Router();

const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    //only send otp when there is  not otp sent earlier or it was sent 10 minutes ago
    const otpExist = await OtpModel.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (
      otpExist.length > 0 &&
      otpExist[0].createdAt > Date.now() - 1000 * 60 * 10
    ) {
      return res.status(400).send({
        status: "fail",
        message: `otp already sent minutes ${Math.ceil(
          (Date.now()-otpExist[0].createdAt )/ 1000 / 60
        )} ago`,
      });
    }

    const otp = Math.floor(Math.random() * 9000 + 1000);

    await sendOtpMail({ otp, email });

    const salt = await bcrypt.genSalt(14);
    // console.log("salt", salt);
    const hash = await bcrypt.hash(otp + "", salt);
    // console.log("hash", hash);

    OtpModel.create({
      email: email,
      otp: hash,
    });

    res.status(201);
    res.json({
      status: "success",
      message: `OTP sent successfully to ${email}`,
    });
  } catch (err) {
    console.log("Error in sendOtpController", err.message);
    res.status(500);
    res.json({
      status: "Fail",
      message: "Internal Server error",
    });
  }
};



// Route to send OTP to email
// POST /api/v1/auth/otps  { "email": "user@example.com" }
otpRouter.post("/otp", sendOtpController);

module.exports = {
  sendOtpController,
};
