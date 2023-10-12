const mongoose = require('mongoose');

//Define the schema for the Chairs
const chairSchema = new mongoose.Schema({
    chair_name: String,
    isBuy: {
        type: Boolean,
        default: false,
        validate: {
            validator: function(value) {
                if (!value) {
                    return this.isCheckin === false;
                }
                return true;
            },
            message: 'If isBuy is false, isCheckin must be false as well.',
        },
    },
    isCheckin: {
        type: Boolean,
        default: false,
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    }
});

//Define the schema for the Areas
const areasSchema = new mongoose.Schema({
    name_areas: String,
    total_row: Number,
    rows: [{
        row_name: String,
        total_chair: Number,
        ticket_price: Number,
        chairs: [chairSchema],
    }],
});

//Define the schema for the Event
const eventSchema = new mongoose.Schema({
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        require: true,
    },
    event_name: { type: String},
    type_of_event: { type: String},
    eventImage: { type: String },
    type_layout: {
        type: String
    },
    event_date: [{ 
        day_number: Number,
        date: Date,
        event_areas: [areasSchema],
    }],
    event_location: { type: String},
    event_description: { type: String},
    sales_date: {
        start_sales_date: { type: Date},
        end_sales_date: { type: Date},
    },
});

// Create the event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;