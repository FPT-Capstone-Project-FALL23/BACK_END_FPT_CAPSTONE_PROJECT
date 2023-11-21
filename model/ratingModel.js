const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Tham chiếu đến mô hình Event
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      star: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
});


const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;