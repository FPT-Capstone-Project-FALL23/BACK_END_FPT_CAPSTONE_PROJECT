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
      let sumRating = 0;

    
    for (const ratingId of event.ratings) {
      const rating = await Rating.findById(ratingId);
      sumRating += rating.star;
    }

    let avgRating = sumRating / event.ratings.length;
    event.totalRating = avgRating;

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

async function deleteRating(req, res) {
  try {
    const { ratingId } = req.body;
    console.log(req.body);
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ msg: 'Rating not found' });
    }
    const event = await Event.findById(rating.event);
    
    event.ratings.pull(ratingId);

    let sumRating = 0;

    // Sử dụng for...of để có thể sử dụng await
    for (const ratingId of event.ratings) {
      const rating = await Rating.findById(ratingId);
      
      sumRating += rating.star;
    }

    let avgRating = 0;

    if (event.ratings.length > 0) {
      avgRating = sumRating / event.ratings.length;
    }

    event.totalRating = avgRating;

    await event.save();
    console.log('Updated Event:', event);
    await Rating.deleteOne({ _id: ratingId });

    res.json({ msg: 'Rating removed' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
}


module.exports = {createRating, deleteRating };