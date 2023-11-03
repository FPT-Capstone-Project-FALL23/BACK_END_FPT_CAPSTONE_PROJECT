const { createZaloPayOrder, callBack, checkZaloPayment, returnZaloMoney, checkZaloReturn } = require('../zalopay/payment');
const Event = require('../model/eventModels');
const Order = require('../model/orderModel');

function createPdfFromHtml(htmlContent) {
    return new Promise((resolve, reject) => {
        pdf.create(htmlContent, { format: 'Letter' }).toBuffer((err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

async function createTicketPdf(_idClient, eventArea, event, chair, qrImageData) {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Concert Ticket</title>
    </head>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .ticket {
            width: 300px;
            background-color: white;
            margin: 20px auto;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .header {
            background-color: #c6c647;
            color: white;
            padding: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            text-align: left;
            padding: 20px;
        }
        .qr-code {
            margin: 20px 0;
        }
    </style>
    <body>
        <div class="ticket">
            <div class="header">
                <h1>TikSeat</h1>
            </div>
            <div class="content">
                <p>Event Name: ${event.event_name}</p>
                <p>Time: ${event.event_date.date}</p>
                <p>Location: ${event.event_location.specific_address}, ${event.event_location.ward}, ${event.event_location.district}, ${event.event_location.city}</p>
                <h3>Ticket Class: ${eventArea.name_areas}</h3>
                <h3>Seat: ${chair.chair_name}</h3>
            </div>
            <div class="qr-code">
                <img src="${qrImageData}" alt="QR Code">
            </div>
        </div>
    </body>
    </html>`;
    // Tạo tệp PDF từ mẫu HTML
    const pdfBuffer = await createPdfFromHtml(htmlTemplate);
    console.log(pdfBuffer);
    // Lưu tệp PDF vào DB
    const newTicket = new Ticket({
        client_id: _idClient,
        pdfTicket: pdfBuffer,
    });
    await newTicket.save();
    // Trả về thông tin vé
    return newTicket;
}
async function createQRcode(req, res) {
    try {
        const { _idEvent, _idArea, chairIds, amount } = req.body;

        const event = await Event.findById(_idEvent);
        // Kiểm tra số lượng vé trong đơn hàng
        const maxTicketInOrder = event.maxTicketInOrder;
        if (maxTicketInOrder !== null && chairIds.length > maxTicketInOrder) {
            return res.status(400).json({
                status: false,
                message: `Bạn chỉ có thể mua tối đa ${maxTicketInOrder} vé trong một đơn hàng`,
            });
        }
        const tickets = [];
        for (const chairId of chairIds) {
            const chair = eventArea.event_areas.find(area => area._id.toString() === _idArea)
                .rows.flatMap(row => row.chairs)
                .find(chair => chair._id.toString() === chairId._id);
            // Tạo mã QR với các ID tương ứng
            const qrData = {
                userId: _idClient,
                eventId: _idEvent,
                eventDate: eventArea.day_number,
                chairId: chairId
            };
            const qrOptions = {
                errorCorrectionLevel: 'H',
                type: 'image/jpeg',
                margin: 1,
                width: 120,
                quality: 0.8
            };
            const qrImageData = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions);
            const ticket = await createTicketPdf(_idClient, eventArea, event, chair, qrImageData);

            tickets.push(ticket);
            // Cập nhật trạng thái ghế đã mua
            chair.client_id = _idClient;
            chair.isBuy = true;
            //tạo link thanh toán
            const describe = `Thanh toán ${chairIds.length} vé cho sự kiện ${event.event_name}`;
            const response = await createZaloPayOrder(describe, amount);
            return res.json({ data: response.data })
        }


        /* const describe = `Thanh toán ${chairIds.length} vé cho sự kiện ${event.event_name}`;
        const response = await createZaloPayOrder(describe, amount);
        return res.json({ data: response.data }) */
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

module.exports = {
    createQRcode,
    callBackZalo,
    createCheckPayment,
    returnMoney,
    createCheckReturn
}