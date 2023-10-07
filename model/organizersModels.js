const mongoose = require('mongoose');

//Define the schema for the Organizer collection
const organizerSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    organizer_name: { type: String },
    avatarImage: { type: String },
    organizer_type: [{ type: String}],
    phone: { type: String },
    website: { type: String },
    founded_date: { type: Date },
    isActive: { type: Boolean },
    description: { type: String },
    address: {
        city: { type: String },
        district: { type: String },
        ward: { type: String },
        specific_address: { type: String },
    },
});

// Create the organizer model
const Organizer = mongoose.model('Organizer', organizerSchema);

module.exports = Organizer;