const { createQRcode, callBackZalo, createCheckPayment, returnMoney, createCheckReturn,
    getOrdersByClient, getOrderDetail, getMyTicket,
    getOrdersAvailableTickets, getOrdersRefundTicket } = require("../controllers/orderController");
const orderRouter = require("express").Router();

orderRouter.post("/createQRcode", createQRcode)
orderRouter.post("/createCheck", createCheckPayment)
orderRouter.post("/callback", callBackZalo)
orderRouter.post("/returnMoney", returnMoney)
orderRouter.post("/createCheckReturn", createCheckReturn)
orderRouter.post("/getOrdersByClient", getOrdersByClient)
orderRouter.post("/getOrderDetail", getOrderDetail)
orderRouter.post("/getMyTicket", getMyTicket)
orderRouter.post("/getOrdersAvailableTickets", getOrdersAvailableTickets)
orderRouter.post("/getOrdersRefundTicket", getOrdersRefundTicket)
module.exports = orderRouter