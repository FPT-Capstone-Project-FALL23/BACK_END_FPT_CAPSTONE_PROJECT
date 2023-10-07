const { loginUser, logoutUser, registerUser, createClient, createOrganizer, resetPassword } = require("../controllers/authController");
const authRouter = require("express").Router();

authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.post("/resigterUser", registerUser)
authRouter.post("/createClient", createClient)
authRouter.post("/createOrganizer", createOrganizer)
authRouter.post("/resetPassword", resetPassword)

module.exports = authRouter