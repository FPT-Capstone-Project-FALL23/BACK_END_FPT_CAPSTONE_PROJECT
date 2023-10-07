const { sendOTPForMailRegister, sendOTPForResetPassword, verifileOTPRegister } = require("../controllers/emailController");

const sendEmail = require("express").Router();

sendEmail.post("/sendOTPResign", sendOTPForMailRegister)
sendEmail.post("/verifleOTPResign", verifileOTPRegister)
sendEmail.post("/sendOTPForResetPassword", sendOTPForResetPassword)

module.exports = sendEmail