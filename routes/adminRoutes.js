const { getAllClients,
    getDetailClient,
    getAllOrganizers,
    getDetailOrganizer,
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
} = require("../controllers/adminControler");

const adminRouter = require("express").Router();

adminRouter.get("/getAllClient", getAllClients)
adminRouter.post("/getDetailClient", getDetailClient)
adminRouter.get("/getAllOrganizers", getAllOrganizers)
adminRouter.get("/getAllOrganizersIsAtivecFalse", getAllOrganizersIsActiveFalse)
adminRouter.get("/getAllEventIsAtivecFalse", getAllEventIsActiveFalse)
adminRouter.post("/getDetailOrganizer", getDetailOrganizer)
adminRouter.post("/setIsActiveOrganizer", setIsActiveOrganizer)
adminRouter.post("/setIsActiveEvent", setIsActiveEvent)
adminRouter.post("/setIsHotEvent", setIsHotEvent)
adminRouter.post("/getDetailEventActiveIsFalse", getDetailEventActiveIsFalse)
adminRouter.get("/getTotalAmountSoldAllEventAndAdminEarnings", getTotalAmountSoldAllEventAndAdminEarnings)
adminRouter.get("/calculateTotalMoneyRefunded", calculateTotalMoneyRefunded)
adminRouter.get("/getAllOrders", getAllOrders)
adminRouter.post("/blockedUser", blockedUser)


module.exports = adminRouter