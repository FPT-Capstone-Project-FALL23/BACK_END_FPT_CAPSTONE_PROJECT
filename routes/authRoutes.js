const { loginUser, logoutUser, registerUser } = require("../controllers/authController");
const { sendOTP } = require("../controllers/otpController");
const authRouter = require("express").Router();

authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.post("/resign", registerUser)



module.exports = authRouter