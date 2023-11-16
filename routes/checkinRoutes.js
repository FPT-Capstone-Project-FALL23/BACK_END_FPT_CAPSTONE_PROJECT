const { getEventToday, check_in} = require("../controllers/checkinController");
const checkinRouter = require("express").Router();

checkinRouter.post("/getEventToday", getEventToday)
checkinRouter.post("/check_in", check_in)

module.exports = checkinRouter