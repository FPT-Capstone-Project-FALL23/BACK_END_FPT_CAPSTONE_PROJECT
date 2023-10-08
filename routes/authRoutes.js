const { loginUser, logoutUser, registerUser, createClient, createOrganizer, resetPassword, updateClient,
    updateOrganizer } = require("../controllers/authController");
const authRouter = require("express").Router();

authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.post("/resigterUser", registerUser)
authRouter.post("/createClient", createClient)
authRouter.post("/createOrganizer", createOrganizer)
authRouter.post("/resetPassword", resetPassword)
authRouter.post("/updateClient", updateClient)
authRouter.post("/updateOrganizer", updateOrganizer)

module.exports = authRouter