const { createEvent, getAllEvents, getEventsByIdOrganizer, getDetailEvent,
   getEventByType, updateEvent, searchEvent, listEventOrganizer,
   statisticalAllEvent, statisticalOneEvent, getEventRating, 
   statisticalMoneyOrganizer, statisticalMoneyEvent } = require("../controllers/eventController");
const eventRouter = require("express").Router();

eventRouter.post("/createEvent", createEvent)
eventRouter.post("/getEvent", getAllEvents)
eventRouter.post("/getEventById", getEventsByIdOrganizer)
eventRouter.post("/getDetailEvent", getDetailEvent)
eventRouter.post("/getEventByType", getEventByType)
eventRouter.post("/updateEvent", updateEvent)
eventRouter.post("/searchEvent", searchEvent)
eventRouter.post("/listEventOrganizer", listEventOrganizer)
eventRouter.post("/statisticalEvent", statisticalAllEvent)
eventRouter.post("/statisticalOneEvent", statisticalOneEvent)
eventRouter.post("/statisticalMoneyEvent", statisticalMoneyEvent)
eventRouter.post("/statisticalMoneyOrganizer", statisticalMoneyOrganizer)
eventRouter.post("/getEventRating", getEventRating)
module.exports = eventRouter