const { getAllClients,
    getDetailClient,
    getAllOrganizers,
    getDetailOrganizer,
    getAllOrganizerBlockeds,
    setIsActiveOrganizer,
    setIsActiveEvent,
    setIsHotEvent,
    getAllOrganizersIsActiveFalse,
    getAllEventIsActiveFalse,
    getDetailEventActiveIsFalse,
    getTotalAmountSoldAllEventAndAdminEarnings,
    calculateTotalMoneyRefunded,
    getAllOrders,
    blockedUser,
    getAllPayBusiness,
    getAllEventsWithOrders,
    getEventByOrderId,
    getInformationEvent,
    getTransactionInformation,
    getTopRatedEvents,
    getHomeAdmin,
    rejectedOrganizer,
    rejectedEvent
} = require("../controllers/adminControler");

const adminRouter = require("express").Router();

adminRouter.post("/getAllClient", getAllClients)
adminRouter.post("/getDetailClient", getDetailClient)
adminRouter.post("/getAllOrganizers", getAllOrganizers)
adminRouter.post("/getAllOrganizerBlockeds", getAllOrganizerBlockeds)
adminRouter.post("/getAllOrganizersIsAtivecFalse", getAllOrganizersIsActiveFalse)
adminRouter.post("/getAllEventIsAtivecFalse", getAllEventIsActiveFalse)
adminRouter.post("/getDetailOrganizer", getDetailOrganizer)
adminRouter.post("/setIsActiveOrganizer", setIsActiveOrganizer)
adminRouter.post("/setIsActiveEvent", setIsActiveEvent)
adminRouter.post("/setIsHotEvent", setIsHotEvent)
adminRouter.post("/getDetailEventActiveIsFalse", getDetailEventActiveIsFalse)
adminRouter.get("/getHomeAdmin", getHomeAdmin)
adminRouter.post("/getAllOrders", getAllOrders)
adminRouter.post("/blockedUser", blockedUser)
adminRouter.post("/getInformationEvent", getInformationEvent)
adminRouter.post("/getTransactionInformation", getTransactionInformation)
adminRouter.get("/getTopRatedEvents", getTopRatedEvents)
adminRouter.post("/rejectedOrganizer", rejectedOrganizer)
adminRouter.post("/rejectedEvent", rejectedEvent)

module.exports = adminRouter