const { createRefund, getListRefund, acceptRefund, listIsRefund, refundMoney, requestRefundMoney } = require('../controllers/refundController');
const refundRouter = require("express").Router();

refundRouter.post("/createRefund", createRefund)
refundRouter.post("/getListRefund", getListRefund)
refundRouter.post("/acceptRefund", acceptRefund)
refundRouter.post("/refundMoney", refundMoney)
refundRouter.get("/listIsRefund", listIsRefund)
refundRouter.post("/requestRefundMoney", requestRefundMoney)

module.exports = refundRouter