const Event = require ("../model/eventModels");
const mongoose = require('mongoose');
const Rating = require ("../model/ratingModel");
const User = require("../model/usersModel");

async function createRating(req, res) {
    try {
      const { eventId, star } = req.body;
      const { userId } = req.body;

        // Kiểm tra và validate userId
        if (!userId) {
            return res.status(400).json({ message: 'userId is required in the request body' });
        }
      const event = await Event.findById(eventId);
      const user = await User.findById(userId);
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const newRating = await Rating.create({
        event: event._id,
        user: user._id, 
        star
      });

      event.ratings.push(newRating._id);

      // // Kiểm tra xem có ratings nào bị NaN không
      // const invalidRatings = event.ratings.filter(ratingId => isNaN(ratingId.star)); 
      // event.ratings = event.ratings.filter(ratingId => !isNaN(ratingId.star));

      // // Kiểm tra xem mảng đánh giá có phần tử còn lại hay không
      // if (event.ratings.length > 0) {
      //   const sum = event.ratings.reduce((total, ratingId) => total + ratingId.star, 0);
      //   const avg = sum / event.ratings.length;
      //   event.totalRating = avg;
      // } else {
      //     // Nếu mảng rỗng, có thể đặt totalRating thành 0 hoặc giá trị mặc định khác
      //     event.totalRating = 0;
      // }
      
      await event.save();
      
      const populatedRating = await Rating.findById(newRating._id).populate('user', 'name');

      res.status(201).json({
        message: 'Rating created',
        rating: populatedRating ,
        
        
      });
    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
}

// function calculateTotalRating(event) {

//   let sum = 0;
//   let ratingsCount = event.ratings.length;

//   event.ratings.forEach(rating => {
//     sum += rating.star; 
//   });

//   return sum / ratingsCount;

// }

// async function getAllRating(req, res) {

// };




module.exports = {createRating };