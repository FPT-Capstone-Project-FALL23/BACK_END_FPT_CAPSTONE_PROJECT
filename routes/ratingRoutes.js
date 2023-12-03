const  {createRating, deleteRating, getRating } = require('../controllers/ratingController');

const ratingRouter = require("express").Router();


ratingRouter.post("/createRating", createRating)
ratingRouter.post("/deleteRating", deleteRating)
ratingRouter.post("/getRating", getRating)

module.exports = ratingRouter