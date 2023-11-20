const  {createRating } = require('../controllers/ratingController');

const ratingRouter = require("express").Router();


ratingRouter.post("/createRating", createRating)

module.exports = ratingRouter