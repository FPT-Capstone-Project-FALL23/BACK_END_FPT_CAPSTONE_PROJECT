 const { createEvent, getAllEvents, getEventsById, getEventByType, updateEvent, searchEvent } = require("../controllers/eventController");
 const eventRouter = require("express").Router();

 eventRouter.post("/createEvent", createEvent),
 eventRouter.get("/getEvent", getAllEvents),
 eventRouter.get("/getEventById", getEventsById),
 eventRouter.get("/getEventByType", getEventByType),
 eventRouter.put("/updateEvent", updateEvent),
 eventRouter.get("/searchEvent", searchEvent)

 module.exports = eventRouter