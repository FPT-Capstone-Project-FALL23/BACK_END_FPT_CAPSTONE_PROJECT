const { sendOTPForMailRegister, sendOTPForResetPassword, verifileOTPRegister, resendOTPForMail } = require("../controllers/emailController");

const sendEmail = require("express").Router();

sendEmail.post("/sendOTPResign", sendOTPForMailRegister)
sendEmail.post("/verifleOTPResign", verifileOTPRegister)
sendEmail.post("/sendOTPForResetPassword", sendOTPForResetPassword)
sendEmail.post("/resendOTPForMail", resendOTPForMail)

module.exports = sendEmail