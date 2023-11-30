const mongoose = require('mongoose');

//Define the schema for the Users collection
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'organizer', 'admin'], required: true },
    isBlocked: { type: Boolean, default: false },
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;