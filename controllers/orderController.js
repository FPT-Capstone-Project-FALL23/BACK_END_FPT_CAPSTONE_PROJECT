const { createZaloPayOrder, callBack, checkZaloPayment, returnZaloMoney, checkZaloReturn } = require('../zalopay/payment');
const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const { formatDate } = require('./adminControler');

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
        // Kiểm tra sự tồn tại của client
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client không tồn tại',
            });
        }
        const orders = await Order.find({ 'Orders.client_id': _idClient }).exec();
        const clientOrders = orders.map(order => {
            order.Orders = order.Orders.filter(orderDetail => orderDetail.client_id.toString() === _idClient.toString());
            return order;
        }).filter(order => order.Orders.length > 0);
        res.status(200).json({ status: true, data: clientOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrderDetail(req, res) {
    try {
        const { _idOrder } = req.body;
        const order = await Order.findOne({ 'Orders._id': _idOrder }).exec();
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
        const eventName = event.event_name;
        const _idChair = order.Orders[0].tickets[0].chair_id;
        let eventDate = null;
        event.event_date.forEach((date) => {
            date.event_areas.forEach((area) => {
                area.rows.forEach((row) => {
                    const chair = row.chairs.find((c) => c._id.toString() == _idChair);
                    if (chair) {
                        eventDate = formatDate(date.date);
                    }
                });
            });
        });
        const orderDetails = order.Orders
            .filter(orderDetail => orderDetail._id.toString() === _idOrder)
            .map(orderDetail => {
                const classTicket = orderDetail.classTicket;
                const chairs = orderDetail.tickets.map(ticket => ticket.chairName);
                const totalPrice = orderDetail.totalAmount;
                const transaction = formatDate(orderDetail.transaction_date);

                return { classTicket, chairs, totalPrice, transaction };
            });
        res.status(200).json({ data: { eventName, eventDate, orderDetails } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getMyTicket(req, res) {
    try {
        const { _idOrder } = req.body;
        const orders = await Order.find({ 'Orders._id': _idOrder }).exec();
        const orderDetails = orders.map(order => {
            order.Orders = order.Orders.filter(orderDetail => orderDetail._id.toString() === _idOrder.toString());
            return order;
        }).filter(order => order.Orders.length > 0);
        res.status(200).json({ status: true, data: orderDetails });
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
    getMyTicket
}