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

// ratingSchema.pre('remove', async function() {
//   // Lấy ra rating sắp xóa
//   const rating = this; 
  
//   // Kiểm tra xem rating có NaN không
//   if(isNaN(rating.star)) {
//     // Tìm sự kiện chứa rating
//     const event = await Event.findById(rating.event);

//     // Xóa rating khỏi mảng của sự kiện
//     event.ratings.pull(rating._id);

//     // Lưu lại sự kiện
//     await event.save();
//   }
  
// })
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;