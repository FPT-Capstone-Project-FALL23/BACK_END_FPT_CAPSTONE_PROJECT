const mongoose = require('mongoose');

//Define the schema for the Users collection
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'organizer', 'admin'], required: true },
    client_info: {
        full_name: { type: String },
        phone: { type: String },
        birthday: { type: Date },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        avatarImage: { type: String }
    },
    organizer_info: {
        company_name: { type: String },
        phone: { type: String },
        Address: {
            city: { type: String },
            district: { type: String },
            ward: { type: String },
            specific_address: { type: String },
        }
    }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;