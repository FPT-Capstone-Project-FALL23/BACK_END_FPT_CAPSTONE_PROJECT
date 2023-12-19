const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const booking = new Map();
let roomsState = new Map();
const roomUsers = new Map();
const dataEvent_areas = new Map();

let onlineUsers = [];
const offlineNotifications = {};

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  const email = socket.handshake.query.email;

  socket.on("join_booking_room", (room) => {
    socket.join(room);
    roomUsers.set(email, room);
    console.log(`User ${email} joined room ${room}`);
    socket.emit("update_booking_room", roomsState.get(room) || []);
  });

  // handle receive event
  // 1. chọn ghế
  socket.on("SELECT_SEAT", (data) => {
    console.log(roomUsers);
    try {
      const eventRowKey = data.eventRowKey;
      let eventRowKeySeats = roomsState.get(eventRowKey);
      if (!eventRowKeySeats) {
        roomsState.set(eventRowKey, []);
        eventRowKeySeats = [];
      }
      if (eventRowKeySeats.includes({ ...data, email }))
        throw new Error("This seat is selected!");
      roomsState.set(eventRowKey, [...eventRowKeySeats, { ...data, email }]);
      console.log(roomsState.get(eventRowKey));
      const room = roomUsers.get(email);
      socket.to(room).emit("update_booking_room", roomsState.get(eventRowKey));
    } catch (error) {
      console.error(error);
    }
  });

  // 2. bỏ chọn ghế
  socket.on("UNSELECT_SEAT", ({ seat, eventRowKey }) => {
    console.log("Received UNSELECT_SEAT event for seat:", seat);
    try {
      let eventRowKeySeats = roomsState.get(eventRowKey);
      if (!eventRowKeySeats) {
        roomsState.set(eventRowKey, []);
        eventRowKeySeats = [];
      }
      const bookedSeat = eventRowKeySeats.find((e) => e.seat === seat);
      if (!bookedSeat) throw new Error("This seat is not available!");
      if (bookedSeat.email != email)
        throw new Error("No selection for this seat, Wrong!");
      eventRowKeySeats = eventRowKeySeats.filter(
        (sSeat) => sSeat.seat !== seat
      );
      roomsState.set(eventRowKey, eventRowKeySeats);
      const room = roomUsers.get(email);
      socket.to(room).emit("update_booking_room", roomsState.get(eventRowKey));
    } catch (error) {
      console.error(error);
    }
  });

  //3. Đóng dialog
  socket.on("CLOSE_DIALOG", (data) => {
    console.log(roomUsers)
    try {
      const eventRowKey = data.eventRowKey;
      console.log("eventRowKey", eventRowKey)
      let eventRowKeySeats = dataEvent_areas.get(eventRowKey);
      console.log("roomsState", dataEvent_areas)
      if (!eventRowKeySeats) {
        dataEvent_areas.set(eventRowKey, []);
        eventRowKeySeats = [];
      }
      if (eventRowKeySeats.includes({ ...data, email }))
        throw new Error("This seat is selected!");
      dataEvent_areas.set(eventRowKey, [...eventRowKeySeats, { ...data, email }]);
      console.log(dataEvent_areas.get(eventRowKey));
      const room = roomUsers.get(email);
      console.log("room", room)
      socket.to(room).emit("before_close_dailog", dataEvent_areas.get(eventRowKey));
    } catch (error) {
      console.error(error);
    }
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${email}`);

    roomsState.forEach((value, key) => {
      value = value.filter((seat) => {
        if (seat.email === email) {
          console.log("Found seat:", seat);
          const room = roomUsers.get(email);
          if (room) {
            socket.to(room).emit(
              "update_booking_room",
              roomsState.get(key).filter((e) => e.email !== email)
            );
          }
          console.log("Found room:", room);
        }
        return seat.email !== email;
      });
      removeUser(socket.id);
      roomsState.set(key, value);
    });
  });

  socket.on("organizerId", (organizerId) => {
    onlineUsers.push({ organizerId, socketId: socket.id });

    if (offlineNotifications[organizerId]) {
      offlineNotifications[organizerId].forEach((notification) => {
        socket.emit("getNotification", notification);
      });
      delete offlineNotifications[organizerId];
    }
  });

  socket.on("_idUser", (_idUser) => {
    onlineUsers.push({ _idUser, socketId: socket.id });

    if (offlineNotifications[_idUser]) {
      offlineNotifications[_idUser].forEach((notification) => {
        socket.emit("adminNotification", notification);
      });
      delete offlineNotifications[_idUser];
    }
  });

  socket.on("new_users", ({ senderName, receiverName }) => {
    const receiver = getUsers(receiverName);

    //to(receiver.socketId)
    if (receiver) {
      io.emit("adminNotification", { senderName });
    } else {
      console.log(`User ${receiverName} not found`);
      // Thêm thông báo vào danh sách thông báo chưa đăng nhập
      if (!offlineNotifications[receiverName]) {
        offlineNotifications[receiverName] = [];
      }
      offlineNotifications[receiverName].push({ senderName });
    }
  });

  socket.on("organizerToAdmin", ({ typeOfNotification, senderName, receiverName }) => {
    const receiver = getUser(receiverName);

    if (receiver) {
      io.emit("getNotification", { senderName, typeOfNotification });
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
