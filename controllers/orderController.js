const { createZaloPayOrder, callBack, checkZaloPayment, returnZaloMoney, checkZaloReturn } = require('../zalopay/payment');
const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');

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
        const description = `Hoàn trả tiền vé sự kiện ${event.event_name}`
        const response = await returnZaloMoney(amount, description, zp_trans_id);
        return res.json({ data: response.data })
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

async function createCheckReturn(req, res) {
    try {
        const { app_trans_id } = req.body;
        const response = await checkZaloReturn(app_trans_id);
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
        const orders = await Order.find({ client_id: _idClient });
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getOrderDetail(req, res) {
    try {
        const { _idOrder } = req.body;
        const order = await Order.findById(_idOrder);
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order không tồn tại',
            });
        }
        const _idEvent = order.event_id;
        const chairIds = order.tickets.map(ticket => ticket.chair_id);
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Event không tồn tại',
            });
        }
        const eventName = event.event_name;
        let eventDate = null;
        let classTicket = null;
        let Chairs = [];
        const totalPrice = order.totalAmount;
        const transaction = order.transaction_date;

        for (const chairId of chairIds) {
            event.event_date.forEach((date) => {
                //xác định ngày diễn ra sự kiện
                eventDate = date.date.toString().split('GMT')[0].trim();//tách xóa chữ múi giờ Đông Dương
                //Xác định khu vực sự kiện
                //Xác định vị trí ghế
                date.event_areas.forEach((area) => {
                    area.rows.forEach((row) => {
                        const chair = row.chairs.find((c) => c._id.toString() == chairId);
                        if (chair) {
                            Chairs.push(chair.chair_name);
                            classTicket = area.name_areas;
                        }
                    });
                });
            });
        }

        res.status(200).json({ data: { eventName, eventDate, classTicket, Chairs, totalPrice, transaction } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getMyTicket(req, res) {
    try {
        const { _idOrder } = req.body;
        const order = await Order.findById(_idOrder);
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order không tồn tại',
            });
        }
        res.status(200).json({ order });
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