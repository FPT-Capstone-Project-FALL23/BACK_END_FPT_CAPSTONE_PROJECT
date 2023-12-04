const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const RefundOrder = require('../model/refundOrderModel');
const Organizer = require('../model/organizersModels');
const mongoose = require('mongoose');
const { returnZaloMoney } = require('../zalopay/payment');
const { getMailOfClient, formatMoney } = require('./adminControler');

async function createRefund(req, res) {
    try {
        const { _idOrder, money_refund, zp_trans_id, chairIds } = req.body;

        const order = await Order.aggregate([
            { $match: { 'Orders._id': new mongoose.Types.ObjectId(_idOrder) } },
            { $unwind: '$Orders' },
            { $limit: 1 },
        ]);
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order does not exist',
            });
        }
        const _idEvent = order[0].event_id;
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
        const _idClient = order[0].Orders.client_id;
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
                //Xác định khu vực sự kiện, vị trí ghế
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
            await Order.findOneAndUpdate(
                {
                    'Orders.tickets.chair_id': chairId
                },
                {
                    $set: {
                        'Orders.$[outer].tickets.$[inner].isRefund': true
                    }
                },
                {
                    arrayFilters: [
                        { 'outer.tickets.chair_id': chairId },
                        { 'inner.chair_id': chairId }
                    ]
                }
            );
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
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await RefundOrder.countDocuments({ organizer_id: _idOrganizer }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        const refund = await RefundOrder.find({ organizer_id: _idOrganizer })
            .sort({ isRefund: 1, refunded: 1, refund_date: -1 })
            .skip(skip)
            .limit(limit);;
        if (!refund) {
            return res.status(400).json({
                status: false,
                message: 'Refund order not found',
            });
        }
        res.status(200).json({ status: true, refund, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function acceptRefund(req, res) {
    try {
        const { _idRefund, isRefund } = req.body;
        if (!isRefund) {
            return res.status(400).json({
                status: false,
                message: 'Reject to refund ticket',
            });
        }
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
        const chairIds = [];
        refund.tickets.forEach(ticket => {
            chairIds.push(ticket.chair_id);
        });
        for (const _idChair of chairIds) {
            await Event.findOneAndUpdate(
                {
                    'event_date.event_areas.rows.chairs._id': _idChair,
                },
                {
                    $set: {
                        'event_date.$[].event_areas.$[].rows.$[].chairs.$[chair].client_id': null,
                        'event_date.$[].event_areas.$[].rows.$[].chairs.$[chair].isBuy': false,
                    },
                },
                {
                    arrayFilters: [{ 'chair._id': _idChair }],
                    new: true,
                }
            );
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
        const totalRefundAmount = listRefund.reduce((sum, refund) => sum + refund.money_refund, 0);
        const countRefund = listRefund.length;
        if (!listRefund) {
            return res.status(400).json({
                status: false,
                message: 'Dont have any Refund Order',
            });
        }

        const fomatInfoRefund = await Promise.all(listRefund.map(async (refund) => {
            const client = await getMailOfClient(refund.client_id)
            return {
                refund_date: refund.refund_date.toISOString().split('T')[0],
                zp_trans_id: refund.zp_trans_id,
                event_name: refund.event_name,
                money_refund: formatMoney(refund.money_refund),
                client_name: client.fomatInfoClient.full_name,
                client_email: client.fomatInfoClient.email,
                numberOfTickets: refund.tickets.length,
                _id: refund._id,
            }
        }))

        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalRefundAmount: formatMoney(totalRefundAmount),
                count: countRefund,
                refunds: fomatInfoRefund
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function refundMoney(req, res) {
    try {
        const { _idRefund } = req.body;
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
        return res.json({ status: true, data: response.data, message: "Refund was successful" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createRefund, getListRefund, acceptRefund, listIsRefund, refundMoney
}