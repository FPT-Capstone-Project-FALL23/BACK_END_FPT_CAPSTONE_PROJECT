const { loginUser, logoutUser, registerUser, createClient, createOrganizer } = require("../controllers/authController");
const authRouter = require("express").Router();

authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.post("/resigterUser", registerUser)
authRouter.post("/createClient", createClient)
authRouter.post("/createOrganizer", createOrganizer)

module.exports = authRouter