const { createQRcode, callBackZalo, createCheck, returnMoney } = require("../controllers/orderController");
const orderRouter = require("express").Router();

orderRouter.post("/createQRcode", createQRcode)
orderRouter.post("/createCheck", createCheck)
orderRouter.post("/callback", callBackZalo)
orderRouter.post("/returnMoney", returnMoney)

module.exports = orderRouter