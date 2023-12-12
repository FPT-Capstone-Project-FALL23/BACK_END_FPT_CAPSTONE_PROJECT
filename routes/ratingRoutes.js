const { createRating, deleteRating, getRating, getClientRating } = require('../controllers/ratingController');

const ratingRouter = require("express").Router();


ratingRouter.post("/createRating", createRating)
ratingRouter.post("/deleteRating", deleteRating)
ratingRouter.post("/getRating", getRating)
ratingRouter.post("/getClientRating", getClientRating)

module.exports = ratingRouter