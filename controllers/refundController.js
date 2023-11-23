const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const RefundOrder = require('../model/refundOrderModel');
const Organizer = require('../model/organizersModels');
const { returnZaloMoney } = require('../zalopay/payment');


async function createRefund(req, res) {
    try {
        const { _idOrder, money_refund, zp_trans_id, chairIds } = req.body;

        const order = await Order.findById(_idOrder);
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order does not exist',
            });
        }
        const _idEvent = order.event_id;
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Event does not exist',
            });
        }
        const _idOrganizer = event.organizer_id;
        const organizer = await Organizer.findById(_idOrganizer);
        if (!organizer) {
            return res.status(400).json({
                status: false,
                message: 'Organizer does not exist',
            });
        }
        const _idClient = order.client_id;
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client does not exist',
            });
        }
        let tickets = [];
        let foundEventArea = null;
        let foundChair = null;
        for (const chairId of chairIds) {
            event.event_date.forEach((date) => {
                //Xác định khu vực sự kiện
                //Xác định vị trí ghế
                date.event_areas.forEach((area) => {
                    area.rows.forEach((row) => {
                        const chair = row.chairs.find((c) => c._id.toString() == chairId);
                        if (chair) {
                            foundChair = chair;
                            foundEventArea = area.name_areas;
                        }
                    });
                });
            });
            tickets.push({
                chair_id: chairId,
                classTicket: foundEventArea,
                chairName: foundChair.chair_name
            });
            const ticket = order.tickets.find(t => t.chair_id.toString() === chairId.toString());
            if (ticket) {
                ticket.isRefund = true;
            }
            await order.save();
        }
        const orderRefund = new RefundOrder({
            order_id: _idOrder,
            event_id: _idEvent,
            organizer_id: _idOrganizer,
            client_id: _idClient,
            event_name: event.event_name,
            money_refund: money_refund,
            zp_trans_id: zp_trans_id,
            tickets: tickets
        });
        await orderRefund.save();
        res.status(200).json({ status: true, message: 'Ticket refund requested' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function getListRefund(req, res) {
    try {
        const { _idOrganizer } = req.body;
        const refund = await RefundOrder.find({ organizer_id: _idOrganizer })
            .sort({ isRefund: 1 });
        if (!refund) {
            return res.status(400).json({
                status: false,
                message: 'Refund order not found',
            });
        }
        res.status(200).json({ status: true, refund });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function acceptRefund(req, res) {
    try {
        const { _idRefund, isRefund } = req.body;
        const refund = await RefundOrder.findOneAndUpdate(
            { _id: _idRefund },
            { $set: { isRefund: isRefund } },
            { new: true }
        );
        if (!refund) {
            return res.status(400).json({
                status: false,
                message: 'Refund Order does not exist',
            });
        }
        res.status(200).json({ status: true, message: 'Accept Refund Tickets' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function listIsRefund(req, res) {
    try {
        const listRefund = await RefundOrder.find({ isRefund: true, refunded: false });
        if (!listRefund) {
            return res.status(400).json({
                status: false,
                message: 'Dont have any Refund Order',
            });
        }
        res.status(200).json({ status: true, listRefund });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function refundMoney(req, res) {
    try {
        const { _idRefund } = req.body;
        //const refund = await RefundOrder.findById(_idRefund);
        const refund = await RefundOrder.findOneAndUpdate(
            { _id: _idRefund },
            { $set: { refunded: true } },
            { new: true }
        );
        if (!refund) {
            return res.status(400).json({
                status: false,
                message: 'Refund Order does not exist',
            });
        }
        const _idEvent = refund.event_id;
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Event does not exist',
            });
        }
        const description = `Hoàn trả tiền vé sự kiện ${event.event_name}`;
        const zp_trans_id = refund.zp_trans_id;
        const amount = refund.money_refund;
        const response = await returnZaloMoney(amount, description, zp_trans_id);
        return res.json({ status: true, data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createRefund, getListRefund, acceptRefund, listIsRefund, refundMoney
}