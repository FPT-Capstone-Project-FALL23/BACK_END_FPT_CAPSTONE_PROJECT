const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const eventController  = require("../controllers/eventController");
const Event = require('../model/eventModels');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let bookingSeats = [];

let onlineUsers = [];
const offlineNotifications = {};

io.on("connection", (socket) => {
  //console.log(`user connected : ${socket.id}`);

  socket.on("organizerId", (organizerId) => {
    onlineUsers.push({organizerId, socketId: socket.id});

    if(offlineNotifications[organizerId]){
      offlineNotifications[organizerId].forEach((notification) => {
        socket.emit("getNotification", notification);
      });
      delete offlineNotifications[organizerId];
    }
  });

  socket.on("_idUser", (_idUser) => {
    onlineUsers.push({_idUser, socketId: socket.id});

    if(offlineNotifications[_idUser]){
      offlineNotifications[_idUser].forEach((notification) => {
        socket.emit("adminNotification", notification);
      });
      delete offlineNotifications[_idUser];
    }
  });

  socket.on('book_seat', chairId => {
    console.log(chairId + "book_seat");
    
    if(bookingSeats.includes(chairId.chairId)) {
      // Trả về lỗi nếu đã có người đặt
      socket.emit('booking_error');
      return;
    }
    
    // Thêm ghế vào danh sách đang đặt
    bookingSeats.push(chairId.chairId);
    console.log('success');
    
    // Gửi cho client ghế đã được đặt thành công
    socket.broadcast.emit('booking_success', chairId.chairId);

    // Sau 10p xóa ghế khỏi danh sách đang đặt
    setTimeout(async () => {
      if (bookingSeats.includes(chairId.chairId)) {
        bookingSeats = bookingSeats.filter(s => s !== chairId.chairId);
        socket.broadcast.emit('booking_timeend', chairId.chairId);
      }
      // Cập nhật lại cơ sở dữ liệu ở đây
      try {
        // Gọi hàm updateChairStatus từ module eventController
        await eventController.updateChairStatus({
            body: {
                _idEvent: chairId._idEvent,
                chairId: chairId.chairId,
            },
        });
    } catch (error) {
        console.error('Error updating chair status:', error);
    }
    }, 20 * 1000);

    

  });

  socket.on("disconnect", () => {
    //console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
  });

  socket.on("new_users", ({senderName, receiverName}) => {
    const receiver = getUsers(receiverName);

    //to(receiver.socketId)
    if (receiver) {
      io.emit("adminNotification", {senderName});
    } else {
      console.log(`User ${receiverName} not found`);
      // Thêm thông báo vào danh sách thông báo chưa đăng nhập
      if (!offlineNotifications[receiverName]) {
        offlineNotifications[receiverName] = [];
      }
      offlineNotifications[receiverName].push({ senderName });
    }
  });

  socket.on("new_event", ({senderName, receiverName}) => {
    const receiver = getUser(receiverName);

    //to(receiver.socketId)
    if (receiver) {
      io.emit("getNotification", {senderName});
    } else {
      console.log(`User ${receiverName} not found`);
      // Thêm thông báo vào danh sách thông báo chưa đăng nhập
      if (!offlineNotifications[receiverName]) {
        offlineNotifications[receiverName] = [];
      }
      offlineNotifications[receiverName].push({ senderName });
    }
  });
});

// Helper functions
const getUser = (organizerId) => {
  return onlineUsers.find((user) => user.organizerId === organizerId);
};

const getUsers = (_idUser) => {
  return onlineUsers.find((user) => user._idUser === _idUser);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};


server.listen(5000, () => {
  console.log("Socket io is running on port 5000");
});