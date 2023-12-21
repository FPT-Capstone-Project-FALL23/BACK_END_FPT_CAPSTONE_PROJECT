const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const RefundOrder = require('../model/refundOrderModel');
const Organizer = require('../model/organizersModels');
const mongoose = require('mongoose');
const { returnZaloMoney } = require('../zalopay/payment');
const { getMailOfClient, formatMoney, calculatePaginationParams } = require('./adminControler');
const User = require('../model/usersModel');
const { sendEmailRequestRefundMoney } = require('./emailController');

async function createRefund(req, res) {
    try {
        const { _idOrderDetail, money_refund, zp_trans_id, chairIds } = req.body;

        const order = await Order.aggregate([
            { $match: { 'Orders._id': new mongoose.Types.ObjectId(_idOrderDetail) } },
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
                chairName: foundChair
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
        const orderRefund = await RefundOrder.findOne({ order_id: order[0]._id });
        if (!orderRefund) {
            return res.status(400).json({
                status: false,
                message: 'OrderRefund not found for the event.',
            });
        }
        orderRefund.organizer_id = _idOrganizer;
        const orderRefundDetail = {
            client_id: _idClient,
            money_refund: money_refund,
            zp_trans_id: zp_trans_id,
            tickets: tickets
        };
        orderRefund.OrderRefunds.push(orderRefundDetail);

        await orderRefund.save();
        res.status(200).json({ status: true, message: 'Ticket refund requested' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function requestRefundMoney(req, res) {
    try {
        const { client_id, event_id } = req.body;
        // const client = await Client.findById(client_id);
        const clientInfo = await getMailOfClient(client_id);
        const emailClient = clientInfo.fomatInfoClient.email;
        const event = await Event.findById(event_id);
        const organizer = await Organizer.findById(event.organizer_id);
        const userOrganizer = await User.findById(organizer.user_id);
        const emailOrganizer = userOrganizer.email;

        await sendEmailRequestRefundMoney(emailClient, emailOrganizer, organizer.organizer_name, event);
        res.status(200).json({ status: true, message: "REQUEST SENT TO TIKSEAT AND ORGANIZER" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}

async function getListRefund(req, res) {
    try {
        const { _idOrganizer } = req.body;
        // const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        // const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        // const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        // const totalEvents = await RefundOrder.countDocuments({ organizer_id: _idOrganizer }); // Tổng số sự kiện trong bảng
        // const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        const listRefund = await RefundOrder.find({ organizer_id: _idOrganizer });
        if (!listRefund) {
            return res.status(400).json({
                status: false,
                message: 'Refund order not found',
            });
        }
        const results = [];
        for (const refund of listRefund) {
            for (const orderRefundDetail of refund.OrderRefunds) {
                const clientInfo = await getMailOfClient(orderRefundDetail.client_id)
                const result = {
                    refund_date: orderRefundDetail.refund_date.toISOString().split('T')[0],
                    zp_trans_id: orderRefundDetail.zp_trans_id,
                    event_name: refund.event_name,
                    classTicket: orderRefundDetail.tickets[0].classTicket,
                    money_refund: formatMoney(orderRefundDetail.money_refund),
                    client_name: clientInfo.fomatInfoClient.full_name,
                    client_email: clientInfo.fomatInfoClient.email,
                    numberOfTickets: orderRefundDetail.tickets.length,
                    isRefund: orderRefundDetail.isRefund,
                    refunded: orderRefundDetail.refunded,
                    chair_name: orderRefundDetail.tickets.map(ticket => ticket.chairName),
                    _id: orderRefundDetail._id,
                };
                results.push(result);
            }
        }
        /* .sort({ isRefund: 1, refunded: 1, refund_date: -1 })
            .skip(skip)
            .limit(limit) */
        results.sort((a, b) => {
            if (a.isRefund !== b.isRefund) {
                return a.isRefund - b.isRefund;
            }

            if (a.refunded !== b.refunded) {
                return a.refunded - b.refunded;
            }

            return new Date(b.refund_date) - new Date(a.refund_date);
        });
        res.status(200).json({ status: true, data: { results/* , totalEvents, totalPages */ } });
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
            { 'OrderRefunds._id': _idRefund },
            { $set: { 'OrderRefunds.$[refund].isRefund': isRefund } },
            {
                arrayFilters: [{ 'refund._id': _idRefund }],
                new: true,
            }
        );

        if (!refund) {
            return res.status(400).json({
                status: false,
                message: 'Refund Order does not exist',
            });
        }
        const chairIds = [];
        refund.OrderRefunds.forEach(Datarefund => {
            Datarefund.tickets.forEach(ticket => {
                chairIds.push(ticket.chair_id);
            });
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
        // const { page } = req.body;
        // const listRefund = await RefundOrder.find({ 'OrderRefunds.isRefund': true, 'OrderRefunds.refunded': false });

        const listRefund = await RefundOrder.find();

        if (!listRefund) {
            return res.status(400).json({
                status: false,
                message: 'Dont have any Refund Order',
            });
        }
        let totalRefundAmount = 0;
        listRefund.forEach((refund) => {
            refund.OrderRefunds.forEach((orderRefundDetail) => {
                totalRefundAmount += orderRefundDetail.money_refund;
            });
        });


        const results = [];
        for (const refund of listRefund) {
            for (const orderRefundDetail of refund.OrderRefunds) {
                const clientInfo = await getMailOfClient(orderRefundDetail.client_id)
                const result = {
                    refund_date: orderRefundDetail.refund_date.toISOString().split('T')[0],
                    zp_trans_id: orderRefundDetail.zp_trans_id,
                    event_name: refund.event_name,
                    money_refund: formatMoney(orderRefundDetail.money_refund),
                    client_name: clientInfo.fomatInfoClient.full_name,
                    client_email: clientInfo.fomatInfoClient.email,
                    numberOfTickets: orderRefundDetail.tickets.length,
                    _id: orderRefundDetail._id,
                    refunded: orderRefundDetail.refunded
                };
                results.push(result);
            }
        }

        const limit = 5;
        results.sort((a, b) => {
            if (a.refunded === b.refunded) {
                const aPaymentDate = new Date(a.refund_date);
                const bPaymentDate = new Date(b.refund_date);
                return aPaymentDate - bPaymentDate;
            }
            return a.refunded ? 1 : -1;
        })

        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalRefundAmount: formatMoney(totalRefundAmount),
                refunds: results.slice(skip, skip + limit),
                lenght: results.length,
                totalPages: totalPages,
                currentPage: currentPage
                // listRefund
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
            { 'OrderRefunds._id': _idRefund },
            { $set: { 'OrderRefunds.$[refund].refunded': true } },
            {
                arrayFilters: [{ 'refund._id': _idRefund }],
                new: true,
            }
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
        let zp_trans_id = null;
        let amount = null;
        const description = `Hoàn trả tiền vé sự kiện ${event.event_name}`;
        const zaloTrans = refund.OrderRefunds.find(orderRefund => orderRefund._id.toString() === _idRefund);
        if (zaloTrans) {
            zp_trans_id = zaloTrans.zp_trans_id;
            amount = zaloTrans.money_refund;
        }
        const response = await returnZaloMoney(amount, description, zp_trans_id);
        return res.json({ status: true, data: response.data, message: "Refund was successful" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createRefund, getListRefund, acceptRefund, listIsRefund, refundMoney, requestRefundMoney
}