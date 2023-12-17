const { createPayBusinessOfEvent, getPayBusinessWithRequest, getPayBusinessWithOrganizers, setIsPayForOrganizers } = require("../controllers/payBusinessController");

const payBusinessRouter = require("express").Router();

payBusinessRouter.post("/createPayBusinessOfEvent", createPayBusinessOfEvent)
payBusinessRouter.post("/getPayBusinessWithRequest", getPayBusinessWithRequest)
payBusinessRouter.post("/getPayBusinessWithOrganizers", getPayBusinessWithOrganizers)
payBusinessRouter.post("/setIsPayForOrganizers", setIsPayForOrganizers)

module.exports = payBusinessRouter
