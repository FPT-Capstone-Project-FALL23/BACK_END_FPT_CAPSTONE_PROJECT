const { createRefund, getListRefund, acceptRefund, listIsRefund, refundMoney } = require('../controllers/refundController');
const refundRouter = require("express").Router();

refundRouter.post("/createRefund", createRefund)
refundRouter.post("/getListRefund", getListRefund)
refundRouter.post("/acceptRefund", acceptRefund)
refundRouter.post("/refundMoney", refundMoney)
refundRouter.post("/listIsRefund", listIsRefund)

module.exports = refundRouter