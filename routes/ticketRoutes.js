const { createTicket } = require("../controllers/ticketController");
const ticketRouter = require("express").Router();

ticketRouter.post("/createTicket", createTicket)

module.exports = ticketRouter