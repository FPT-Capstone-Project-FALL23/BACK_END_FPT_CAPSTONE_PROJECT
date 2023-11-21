const Event = require ("../model/eventModels");
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


module.exports = {createRating };