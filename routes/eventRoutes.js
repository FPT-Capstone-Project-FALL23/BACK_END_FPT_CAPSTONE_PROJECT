 const { createEvent } = require("../controllers/eventController");
 const eventRouter = require("express").Router();

 eventRouter.post("/createEvent", createEvent)

 module.exports = eventRouter