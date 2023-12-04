const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = new mongoose.Schema({
    chair_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    classTicket: { type: String },
    chairName: { type: String },
    ticket_price: { type: Number },
    isRefund: { type: Boolean, default: false },
    ticket: { type: String }
});

// Define the OrderDetail schema
const orderDetailSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    totalAmount: { type: Number, required: true },
    transaction_date: { type: Date, default: Date.now },
    zp_trans_id: { type: String },
    tickets: [ticketSchema],
});

//Define the  Order Schema
const orderSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    event_name: { type: String },
    event_date: { type: Date },
    event_location: { type: String },
    Orders: [orderDetailSchema],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;