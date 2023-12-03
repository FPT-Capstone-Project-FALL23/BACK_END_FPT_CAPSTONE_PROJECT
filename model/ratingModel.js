const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
})
const ratingSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Tham chiếu đến mô hình Event
        required: true,
    },
    user: [detailSchema]
      
});


const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;