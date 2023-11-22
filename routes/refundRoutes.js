const { createRefund, getListRefund, acceptRefund } = require('../controllers/refundController');
const refundRouter = require("express").Router();

refundRouter.post("/createRefund", createRefund)
refundRouter.post("/getListRefund", getListRefund)
refundRouter.post("/acceptRefund", acceptRefund)

module.exports = refundRouter