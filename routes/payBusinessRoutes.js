const { createPayBusinessOfEvent, getPayBusinessWithRequest, getPayBusinessWithOrganizers } = require("../controllers/payBusinessController");

const payBusinessRouter = require("express").Router();

payBusinessRouter.post("/createPayBusinessOfEvent", createPayBusinessOfEvent)
payBusinessRouter.get("/getPayBusinessWithRequest", getPayBusinessWithRequest)
payBusinessRouter.post("/getPayBusinessWithOrganizers", getPayBusinessWithOrganizers)

module.exports = payBusinessRouter
