const { createEvent, getAllEvents, getEventsByIdOrganizer, getDetailEvent,
   getEventByType, updateEvent, searchEvent, listEventOrganizer,
   statisticalAllEvent, statisticalOneEvent, /* getEventRating, */
   statisticalMoneyOrganizer, statisticalMoneyEvent,
   selectChairInArea, getTopRatedEventOfOrganizer, getLatestHotEventImages, getEventAreasById, getHotActiveEventsWithSales } = require("../controllers/eventController");
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
eventRouter.post("/getTopRatedEventOfOrganizer", getTopRatedEventOfOrganizer)
// eventRouter.post("/getEventRating", getEventRating)
eventRouter.post("/selectChairInArea", selectChairInArea)
eventRouter.get("/getLatestHotEventImages", getLatestHotEventImages)
eventRouter.post("/getEventAreasById", getEventAreasById)
eventRouter.get("/getHotActiveEventsWithSales", getHotActiveEventsWithSales)
module.exports = eventRouter