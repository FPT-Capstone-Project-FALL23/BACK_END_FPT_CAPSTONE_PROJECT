const mongoose = require('mongoose');

const payForEvent = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    totalEventAmount: { type: Number },
    paymentDate: { type: Date },
    isPay: { type: Boolean, default: false },
    isRequest: { type: Boolean }
})

const payBusinessSchema = new mongoose.Schema({
    organizers_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        require: true,
    },
    pay: [payForEvent],
    organizerTotalAmount: { type: Number },
})

const PayBusiness = mongoose.model('PayBusiness', payBusinessSchema);
module.exports = PayBusiness;