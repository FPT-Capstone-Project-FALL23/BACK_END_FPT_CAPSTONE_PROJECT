const { createQRcode, callBackZalo, createCheckPayment, returnMoney, createCheckReturn, 
    getOrdersByClient, getOrderDetail } = require("../controllers/orderController");
const orderRouter = require("express").Router();

orderRouter.post("/createQRcode", createQRcode)
orderRouter.post("/createCheck", createCheckPayment)
orderRouter.post("/callback", callBackZalo)
orderRouter.post("/returnMoney", returnMoney)
orderRouter.post("/createCheckReturn", createCheckReturn)
orderRouter.post("/getOrdersByClient", getOrdersByClient)
orderRouter.post("/getOrderDetail", getOrderDetail)

module.exports = orderRouter