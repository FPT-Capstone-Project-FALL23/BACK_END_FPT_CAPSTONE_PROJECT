const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    chair_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    classTicket: { type: String },
    chairName: { type: String }
});

const refundOrderDetailSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    money_refund: { type: Number },
    zp_trans_id: { type: String },
    isRefund: { type: Boolean, default: false },
    refunded: { type: Boolean, default: false },
    refund_date: { type: Date, default: Date.now },
    tickets: [ticketSchema],

});

const refundOrderSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    organizer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    event_name: { type: String },
    OrderRefunds: [refundOrderDetailSchema],
});
const RefundOrder = mongoose.model('RefundOrder', refundOrderSchema);

module.exports = RefundOrder;