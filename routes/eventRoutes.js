 const { createEvent, getAllEvents, getEventsById, getEventByType } = require("../controllers/eventController");
 const eventRouter = require("express").Router();

 eventRouter.post("/createEvent", createEvent),
 eventRouter.get("/getEvent", getAllEvents),
 eventRouter.post("/getEventById", getEventsById),
 eventRouter.post("/getEventByType", getEventByType)

 module.exports = eventRouter