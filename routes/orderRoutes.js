const { createQRcode, callBackZalo, createCheckPayment, returnMoney, createCheckReturn } = require("../controllers/orderController");
const orderRouter = require("express").Router();

orderRouter.post("/createQRcode", createQRcode)
orderRouter.post("/createCheck", createCheckPayment)
orderRouter.post("/callback", callBackZalo)
orderRouter.post("/returnMoney", returnMoney)
orderRouter.post("/createCheckReturn", createCheckReturn)

module.exports = orderRouter