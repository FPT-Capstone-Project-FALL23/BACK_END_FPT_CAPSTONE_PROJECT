const { createEventTicket } = require("../controllers/ticketController");
 const ticketRouter = require("express").Router();

 ticketRouter.post("/createEventTicket", createEventTicket)

 module.exports = ticketRouter