const mongoose = require('mongoose');

//Define the schema for the Event
const eventSchema = new mongoose.Schema({
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        require: true,
    },
    event_name: { type: String},
    type_of_event: { type: String},
    event_date: [{ 
        day_number: Number,
        date: Date,
        ticket_areas: [{
            name_ticket_areas: String,
            sections: [{
                name_sections: String,
                rows: [{
                    row_name: String,
                    chairs: [{
                        chair_number: Number,
                        ticket_price: Number
                    }],
                }],
            }],
        }],
    }],
    event_location: { type: String},
    event_description: { type: String},
    sales_date: {
        start_sales_date: { type: Date},
        end_sales_date: { type: Date},
    },
    event_areas: [{ type: String}],
});

// Create the event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;