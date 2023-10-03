 const { createEvent, getAllEvents, getEventsById, getEventByType, updateEvent, searchEvent } = require("../controllers/eventController");
 const eventRouter = require("express").Router();

 eventRouter.post("/createEvent", createEvent),
 eventRouter.post("/getEvent", getAllEvents),
 eventRouter.post("/getEventById", getEventsById),
 eventRouter.post("/getEventByType", getEventByType),
 eventRouter.post("/updateEvent", updateEvent),
 eventRouter.post("/searchEvent", searchEvent)

 module.exports = eventRouter