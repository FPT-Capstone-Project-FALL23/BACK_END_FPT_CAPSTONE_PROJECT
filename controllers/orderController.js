const { createZaloPayOrder, callBack, checkZaloPayment, returnZaloMoney, checkZaloReturn } = require('../zalopay/payment');
const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const { formatDate, formatDateTime, getMailOfClient } = require('./adminControler');
const RefundOrder = require('../model/refundOrderModel');

async function createQRcode(req, res) {
    try {
        /* const { _idClient } = req.body;
        const { email } = req.body; */
        const { _idEvent, chairIds, amount } = req.body;

        const event = await Event.findById(_idEvent);
        // Kiểm tra số lượng vé trong đơn hàng
        const maxTicketInOrder = event.maxTicketInOrder;
        if (maxTicketInOrder !== null && chairIds.length > maxTicketInOrder) {
            return res.status(400).json({
                status: false,
                message: `Bạn chỉ có thể mua tối đa ${maxTicketInOrder} vé trong một đơn hàng`,
            });
        }
        //const ticket = createTicket(_idClient, email, event, chairIds);


        const describe = `Thanh toán ${chairIds.length} vé cho sự kiện ${event.event_name}`;
        const response = await createZaloPayOrder(describe, amount);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}
async function callBackZalo(req, res) {
    try {
        const dataStr = req.body.data;
        const reqMac = req.body.mac;
        const response = callBack(dataStr, reqMac);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function createCheckPayment(req, res) {
    try {
        const { app_trans_id } = req.body;
        const response = await checkZaloPayment(app_trans_id);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function returnMoney(req, res) {
    try {
        const { amount, _idEvent, zp_trans_id } = req.body;
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Sự kiện không tồn tại',
            });
        }
        const description = `Hoàn trả tiền vé sự kiện ${event.event_name}`
        const response = await returnZaloMoney(amount, description, zp_trans_id);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function createCheckReturn(req, res) {
    try {
        const { m_refund_id } = req.body;
        const response = await checkZaloReturn(m_refund_id);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function getOrdersByClient(req, res) {
    try {
        const { _idClient } = req.body;
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client không tồn tại',
            });
        }
        const orders = await Order.find({ 'Orders.client_id': _idClient }).exec();
        const results = [];
        for (const order of orders) {
            for (const orderDetail of order.Orders) {
                let refundTicketCount = 0;
                let totalAvailableTickets = 0;
                for (const ticket of orderDetail.tickets) {
                    if (ticket.isRefund === true) {
                        refundTicketCount++;
                    }
                    else {
                        totalAvailableTickets++;
                    }
                }
                const result = {
                    client_id: orderDetail.client_id,
                    event_id: order.event_id,
                    event_name: order.event_name,
                    event_date: order.event_date,
                    event_location: order.event_location,
                    totalAmount: orderDetail.totalAmount,
                    zp_trans_id: orderDetail.zp_trans_id,
                    transaction: orderDetail.transaction_date,
                    classTicket: orderDetail.tickets[0].classTicket,
                    chair_name: orderDetail.tickets.map(ticket => ticket.chairName),
                    refundTicketCount: refundTicketCount,
                    totalAvailableTickets: totalAvailableTickets,
                    _idOrderDetail: orderDetail._id,
                };
                results.push(result);
            }
        }
        const orderByClients = results.filter(result => result.client_id.equals(_idClient));
        res.status(200).json({ status: true, data: orderByClients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrdersAvailableTickets(req, res) {
    try {
        const { _idClient } = req.body;
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client không tồn tại',
            });
        }
        const orders = await Order.find({ 'Orders.client_id': _idClient }).exec();
        const results = [];
        for (const order of orders) {
            for (const orderDetail of order.Orders) {
                let refundTicketCount = 0;
                let totalAvailableTickets = 0;
                for (const ticket of orderDetail.tickets) {
                    if (ticket.isRefund === true) {
                        refundTicketCount++;
                    }
                    else {
                        totalAvailableTickets++;
                    }
                }
                if (totalAvailableTickets > 0) {
                    const result = {
                        client_id: orderDetail.client_id,
                        event_id: order.event_id,
                        event_name: order.event_name,
                        event_date: order.event_date,
                        event_location: order.event_location,
                        totalAmount: orderDetail.totalAmount,
                        zp_trans_id: orderDetail.zp_trans_id,
                        transaction: orderDetail.transaction_date,
                        classTicket: orderDetail.tickets[0].classTicket,
                        chair_name: orderDetail.tickets.map(ticket => ticket.chairName),
                        refundTicketCount: refundTicketCount,
                        totalAvailableTickets: totalAvailableTickets,
                        _idOrderDetail: orderDetail._id,
                    };
                    results.push(result);
                }
            }
        }
        const orderByClients = results.filter(result => result.client_id.equals(_idClient));
        res.status(200).json({ status: true, data: orderByClients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrdersRefundTicket(req, res) {
    try {
        const { _idClient } = req.body;
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client không tồn tại',
            });
        }
        const orders = await Order.find({ 'Orders.client_id': _idClient }).exec();
        const results = [];
        for (const order of orders) {
            for (const orderDetail of order.Orders) {
                let refundTicketCount = 0;
                let totalAvailableTickets = 0;
                for (const ticket of orderDetail.tickets) {
                    if (ticket.isRefund === true) {
                        refundTicketCount++;
                    }
                    else {
                        totalAvailableTickets++;
                    }
                }
                if (refundTicketCount > 0) {
                    const result = {
                        client_id: orderDetail.client_id,
                        event_id: order.event_id,
                        event_name: order.event_name,
                        event_date: order.event_date,
                        event_location: order.event_location,
                        totalAmount: orderDetail.totalAmount,
                        zp_trans_id: orderDetail.zp_trans_id,
                        transaction: orderDetail.transaction_date,
                        classTicket: orderDetail.tickets[0].classTicket,
                        chair_name: orderDetail.tickets.map(ticket => ticket.chairName),
                        refundTicketCount: refundTicketCount,
                        totalAvailableTickets: totalAvailableTickets,
                        _idOrderDetail: orderDetail._id,
                    };
                    results.push(result);
                }
            }
        }
        const orderByClients = results.filter(result => result.client_id.equals(_idClient));
        res.status(200).json({ status: true, data: orderByClients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrderDetail(req, res) {
    try {
        const { _idOrderDetail } = req.body;
        const order = await Order.findOne({ 'Orders._id': _idOrderDetail }).exec();
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order không tồn tại',
            });
        }
        const event = await Event.findById(order.event_id);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Event không tồn tại',
            });
        }
        const orderDetails = order.Orders
            .filter(orderDetail => orderDetail._id.toString() === _idOrderDetail)
            .map(orderDetail => {
                const eventName = order.event_name;
                const eventDate = order.event_date;
                const classTicket = orderDetail.tickets[0].classTicket;
                const chairs = orderDetail.tickets.map(ticket => ticket.chairName);
                const totalAmount = orderDetail.totalAmount;
                const transaction = orderDetail.transaction_date;

                return { eventName, eventDate, classTicket, chairs, totalAmount, transaction };
            });
        res.status(200).json({ data: orderDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getMyTicket(req, res) {
    try {
        const { _idOrderDetail } = req.body;

        const order = await Order.findOne({ 'Orders._id': _idOrderDetail }).exec();
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const orderDetail = order.Orders.find(orderDetail => orderDetail._id.toString() === _idOrderDetail.toString());
        if (!orderDetail) {
            res.status(404).json({ error: 'Order detail not found' });
            return;
        }

        const refundOrder = await RefundOrder.findOne({ order_id: order._id }).exec();
        console.log("refundOrder", refundOrder)
        if (!refundOrder) {
            orderDetail.refunded = false;
        } else {
            const refundedTickets = refundOrder.OrderRefunds
                .filter(refund => refund.client_id.toString() === orderDetail.client_id.toString())
                .map(refund => refund.tickets.map(ticket => ticket.chair_id.toString()))
                .reduce((acc, val) => acc.concat(val), []);
            console.log("refundedTickets", refundedTickets)
            orderDetail.tickets.forEach(ticket => {
                ticket.refunded = refundedTickets.includes(ticket.chair_id.toString());
                console.log("ticket.refunded", ticket.refunded)
            });
        }

        // Format the data
        const formattedData = {
            _id: order._id,
            event_id: order.event_id,
            event_name: order.event_name,
            event_date: order.event_date,
            event_location: order.event_location,
            Orders: [
                {
                    client_id: orderDetail.client_id,
                    totalAmount: orderDetail.totalAmount,
                    zp_trans_id: orderDetail.zp_trans_id,
                    transaction_date: orderDetail.transaction_date,
                    tickets: orderDetail.tickets.map(ticket => ({
                        chair_id: ticket.chair_id,
                        classTicket: ticket.classTicket,
                        chairName: ticket.chairName,
                        ticket_price: ticket.ticket_price,
                        isRefund: ticket.isRefund,
                        refunded: ticket.refunded,
                        ticket: ticket.ticket,
                        _id: ticket._id
                    }))
                }
            ]
        };

        res.status(200).json({ status: true, data: formattedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    createQRcode,
    callBackZalo,
    createCheckPayment,
    returnMoney,
    createCheckReturn,
    getOrdersByClient,
    getOrderDetail,
    getMyTicket,
    getOrdersAvailableTickets,
    getOrdersRefundTicket
}