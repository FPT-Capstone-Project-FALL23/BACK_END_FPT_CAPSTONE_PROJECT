const { createPayBusinessOfEvent } = require("../controllers/payBusinessController");

const payBusinessRouter = require("express").Router();

payBusinessRouter.post("/createPayBusinessOfEvent", createPayBusinessOfEvent)

module.exports = payBusinessRouter
