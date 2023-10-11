const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Reference to the Event model
        required: true,
    },
    event_name: { type: String },
    event_date: { type: Date },
    ticket_quantity: { type: Number },
    ticket_price: { type: Number },
    total_cost: { type: Number },
    seat_names: [{ type: String }]
});

//Define the schema for the Client collection
const clientSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    full_name: { type: String },
    phone: { type: String },
    birthday: { type: Date },
    gender: { type: String },
    avatarImage: { type: String },
    purchased_tickets: [ticketSchema],
    favorit_enres: { type: [String], }
});

// Create the Client model
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;