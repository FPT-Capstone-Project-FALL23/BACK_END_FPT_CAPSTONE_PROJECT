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

// Define the Order schema
const orderSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    event_name: { type: String },
    event_date: { type: Date },
    event_location: { type: String },
    totalAmount: { type: Number, required: true },
    transaction_date: { type: Date, default: Date.now },
    zp_trans_id: { type: String },
    tickets: [ticketSchema],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;