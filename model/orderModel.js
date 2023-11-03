const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = new mongoose.Schema({
    pdfTicket: { type: Buffer }
});

// Define the Order schema
const orderSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client', // Reference to the Client model
        required: true,
    },
    totalAmount: { type: Number, required: true },
    tickets: [ticketSchema],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;