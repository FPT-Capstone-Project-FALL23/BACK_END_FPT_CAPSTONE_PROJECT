const { getAllClients, getDetailClient, getAllOrganizers, getDetailOrganizer } = require("../controllers/adminControler");

const adminRouter = require("express").Router();

adminRouter.get("/getAllClient", getAllClients)
adminRouter.post("/getDetailClient", getDetailClient)
adminRouter.get("/getAllOrganizers", getAllOrganizers)
adminRouter.post("/getDetailOrganizer", getDetailOrganizer)

module.exports = adminRouter