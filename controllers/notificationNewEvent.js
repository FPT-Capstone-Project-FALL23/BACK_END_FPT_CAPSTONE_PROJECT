const express = require("express");
const http = require("http");
const socketIo = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let onlineUsers = [];
const offlineNotifications = {};

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("organizerId", (organizerId) => {
    onlineUsers.push({organizerId, socketId: socket.id});

    if(offlineNotifications[organizerId]){
      offlineNotifications[organizerId].forEach((notification) => {
        socket.emit("getNotification", notification);
      });
      delete offlineNotifications[organizerId];
    }
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected");
    removeUser(socket.id);
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

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};


server.listen(5000, () => {
  console.log("Socket io is running on port 5000");
});