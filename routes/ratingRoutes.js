const  {createRating, deleteRating } = require('../controllers/ratingController');

const ratingRouter = require("express").Router();


ratingRouter.post("/createRating", createRating)
ratingRouter.post("/deleteRating", deleteRating)

module.exports = ratingRouter