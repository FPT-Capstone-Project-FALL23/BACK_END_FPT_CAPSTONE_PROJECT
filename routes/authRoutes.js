const { loginUser, logoutUser, registerUser, createClient, createOrganizer, 
    resetPassword, changePassword, updateClient,
    updateOrganizer, getProfile } = require("../controllers/authController");
const authRouter = require("express").Router();

authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.post("/resigterUser", registerUser)
authRouter.post("/createClient", createClient)
authRouter.post("/createOrganizer", createOrganizer)
authRouter.post("/resetPassword", resetPassword)
authRouter.post("/updateClient", updateClient)
authRouter.post("/updateOrganizer", updateOrganizer)
authRouter.post("/changePassword", changePassword)
authRouter.post("/getProfile", getProfile)

module.exports = authRouter