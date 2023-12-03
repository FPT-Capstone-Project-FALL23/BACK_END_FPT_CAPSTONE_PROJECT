const Event = require ("../model/eventModels");
const Rating = require ("../model/ratingModel");
const Client = require ("../model/clientsModel");
const mongoose = require('mongoose');


async function createRating(req, res) {
  try {
      const { event_id, star, client_id } = req.body;

      // Kiểm tra xem các trường bắt buộc có được cung cấp không
      if (!event_id || !star || !client_id) {
          return res.status(400).json({ error: 'Vui lòng cung cấp event_id, star, và client_id' });
      }

      // Giả sử bạn có các mô hình cho 'Event', 'Client', và 'Rating'
      // Kiểm tra xem Event và Client tham chiếu có tồn tại không
      const eventExists = await Event.findById(event_id);
      const clientExists = await Client.findById(client_id);

      if (!eventExists || !clientExists) {
          return res.status(404).json({ error: 'Không tìm thấy Event hoặc Client' });
      }

      // Tìm bản ghi xếp hạng có sẵn dựa trên event_id
      const existingRating = await Rating.findOne({ event_id });

      if (existingRating) {
        // Kiểm tra xem client_id đã đánh giá chưa
        const hasRated = existingRating.user.some(user => user.client_id.equals(client_id));

        if (hasRated) {
            return res.status(400).json({ error: 'Bạn chỉ được đánh giá 1 lần cho 1 sự kiện' });
        }
          // Nếu đã có bản ghi xếp hạng, thêm người dùng mới vào mảng user
          existingRating.user.push({ client_id, star });
          const updatedRating = await existingRating.save();

          // Tính toán trung bình số sao và cập nhật totalRating
          const ratings = existingRating.user.map(user => user.star);
          const averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
          eventExists.totalRating = averageRating;
          await eventExists.save();

          return res.status(201).json({ message: 'Đánh giá đã được thêm thành công', totalRating: eventExists.totalRating, updatedRating });
      } else {
          // Nếu không tìm thấy bản ghi xếp hạng, tạo mới với người dùng đầu tiên
          const newRating = new Rating({
              event_id,
              user: [{ client_id, star }]
          });
          const savedRating = await newRating.save();

          // Tính toán trung bình số sao và cập nhật totalRating
          const ratings = newRating.user.map(user => user.star);
          const averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
          eventExists.totalRating = averageRating;
          await eventExists.save();

          return res.status(201).json({ message: 'Đánh giá đã được thêm thành công', totalRating: eventExists.totalRating, updatedRating });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
}

async function deleteRating(req, res) {
  try {
      const { event_id, client_id } = req.body;

      // Kiểm tra xem các trường bắt buộc có được cung cấp không
      if (!event_id || !client_id) {
          return res.status(400).json({ error: 'Vui lòng cung cấp event_id và client_id' });
      }

      // Giả sử bạn có các mô hình cho 'Event', 'Client', và 'Rating'
      // Kiểm tra xem Event và Client tham chiếu có tồn tại không
      const eventExists = await Event.findById(event_id);
      const clientExists = await Client.findById(client_id);

      if (!eventExists || !clientExists) {
          return res.status(404).json({ error: 'Không tìm thấy Event hoặc Client' });
      }

      // Tìm bản ghi xếp hạng có sẵn dựa trên event_id
      const existingRating = await Rating.findOne({ event_id });

      if (existingRating) {
          // Lọc ra người dùng có client_id cần xóa khỏi mảng user
          existingRating.user = existingRating.user.filter(user => user.client_id.toString() !== client_id);

          // Lưu lại bản ghi xếp hạng sau khi loại bỏ đánh giá của client
          const updatedRating = await existingRating.save();

          // Tính toán lại trung bình số sao và cập nhật totalRating
          const ratings = existingRating.user.map(user => user.star);
          const averageRating = ratings.length > 0 ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length : 0;
          eventExists.totalRating = averageRating;
          await eventExists.save();

          res.status(200).json({ message: 'Đánh giá đã được xóa thành công', totalRating: eventExists.totalRating });
      } else {
          // Nếu không tìm thấy bản ghi xếp hạng, có thể xử lý theo ý của bạn
          res.status(404).json({ error: 'Không tìm thấy bản ghi xếp hạng cho sự kiện này' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
}

async function getRating(req, res) {
  try {
      const { event_id } = req.body;

      // Kiểm tra xem event_id có được cung cấp không
      if (!event_id) {
          return res.status(400).json({ error: 'Vui lòng cung cấp event_id' });
      }

      // Giả sử bạn có các mô hình cho 'Event' và 'Rating'
      // Kiểm tra xem Event tham chiếu có tồn tại không
      const eventExists = await Event.findById(event_id);

      if (!eventExists) {
          return res.status(404).json({ error: 'Không tìm thấy Event' });
      }

      // Tìm bản ghi xếp hạng có sẵn dựa trên event_id
      const existingRating = await Rating.findOne({ event_id });

      if (existingRating) {
        res.status(200).json({ message: 'Thông tin đánh giá', totalRating: eventExists.totalRating, ratingData: existingRating });
      } else {
          res.status(404).json({ error: 'Không tìm thấy đánh giá cho sự kiện này' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
}

module.exports = {createRating, deleteRating, getRating };









