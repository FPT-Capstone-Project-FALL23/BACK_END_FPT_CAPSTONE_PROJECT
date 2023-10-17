const { createEvent, getAllEvents, getEventsByIdOrganizer, getDetailEvent,
   getEventByType, updateEvent, searchEvent,
   totalMoney } = require("../controllers/eventController");
const eventRouter = require("express").Router();

eventRouter.post("/createEvent", createEvent),
eventRouter.post("/getEvent", getAllEvents),
eventRouter.post("/getEventById", getEventsByIdOrganizer),
eventRouter.post("/getDetailEvent", getDetailEvent),
eventRouter.post("/getEventByType", getEventByType),
eventRouter.post("/updateEvent", updateEvent),
eventRouter.post("/searchEvent", searchEvent),
eventRouter.post("/totalMoney", totalMoney)

module.exports = eventRouter