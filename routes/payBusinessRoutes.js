const { createPayBusinessOfEvent, getPayBusinessWithRequest, getPayBusinessWithOrganizers, calculateTotalAmountAndTransactionNumber } = require("../controllers/payBusinessController");

const payBusinessRouter = require("express").Router();

payBusinessRouter.post("/createPayBusinessOfEvent", createPayBusinessOfEvent)
payBusinessRouter.get("/getPayBusinessWithRequest", getPayBusinessWithRequest)
payBusinessRouter.post("/getPayBusinessWithOrganizers", getPayBusinessWithOrganizers)
payBusinessRouter.get("/calculateTotalAmountAndTransactionNumber", calculateTotalAmountAndTransactionNumber)

module.exports = payBusinessRouter
