const { sendOTPForMailRegister, verifileOTPRegister } = require("../controllers/emailController");

const sendEmail = require("express").Router();

sendEmail.post("/sendOTPResign", sendOTPForMailRegister)
sendEmail.post("/verifleOTPResign", verifileOTPRegister)

module.exports = sendEmail