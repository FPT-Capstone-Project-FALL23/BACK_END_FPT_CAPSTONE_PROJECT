const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { upLoadImg } = require('../controllers/authController');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const Event = require('../model/eventModels');
const { checkZaloPayment } = require('../zalopay/payment');
const { htmlTicket } = require("../config/constHTML");
const { sendTicketByEmail } = require("../controllers/emailController");
const { formatDate } = require("../controllers/adminControler");

/*=============================
## Name function: writeIdClientToChair
## Describe: ghi thông tin người mua vào ghế
## Params: _idClient, _idChair
## Result: 
===============================*/
async function writeIdClientToChair(_idClient, _idChair) {
    // Tìm và ghi thông tin của người mua vào ghế ngồi
    return writeToChair = await Event.findOneAndUpdate(
        {
            'event_date.event_areas.rows.chairs._id': _idChair,
        },
        {
            $set: {
                'event_date.$[].event_areas.$[].rows.$[].chairs.$[chair].client_id': _idClient,
                'event_date.$[].event_areas.$[].rows.$[].chairs.$[chair].isBuy': true,
            },
        },
        {
            arrayFilters: [{ 'chair._id': _idChair }],
            new: true,
        }
    );
}

/*=============================
## Name function: createTicket
## Describe: Tạo vé sự kiện
## Params: _idClient, _idEvent, chairIds, totalAmount, email
## Result: message
===============================*/
async function createTicket(req, res) {
    try {
        const { _idClient, _idEvent, chairIds, totalAmount, email, app_trans_id } = req.body;
        // Kiểm tra sự tồn tại của client
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client does not exist',
            });
        }
        // Kiểm tra sự tồn tại của sự kiện và xác thực người tổ chức
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Event does not exist',
            });
        }
        const response = await checkZaloPayment(app_trans_id);
        if (response.data.return_code != 1) {
            return res.status(400).json({
                status: false,
                message: 'Payment failed',
            });
        }
        const zp_trans_id = response.data.zp_trans_id;
        // Mở trình duyệt với Puppeteer
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        let buffers = [];
        let tickets = [];
        let foundEventArea = null;
        let foundChair = null;
        let founDayEvent = null;
        let ticket_price = null;
        // Lặp qua từng idchair để tạo vé và gửi qua email
        for (const chairId of chairIds) {
            // Tạo mã QR với các ID tương ứng
            const qrData = {
                userId: _idClient,
                eventId: _idEvent,
                //dayEvent: ,
                chairId: chairId
            };
            const qrOptions = {
                errorCorrectionLevel: 'H',
                type: 'image/jpeg',
                margin: 1,
                width: 120,
                quality: 0.8
            };
            event.event_date.forEach((date) => {
                //xác định ngày diễn ra sự kiện
                founDayEvent = formatDate(date.date);
                timeEvent = date.date.toTimeString().split(" ")[0];
                //Xác định khu vực sự kiện
                //Xác định vị trí ghế
                date.event_areas.forEach((area) => {
                    area.rows.forEach((row) => {
                        const chair = row.chairs.find((c) => c._id.toString() == chairId);
                        if (chair) {
                            foundChair = chair;
                            foundEventArea = area.name_areas;
                            ticket_price = area.ticket_price;
                        }
                    });
                });
            });
            const qrImageData = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions);
            const htmlContent = await htmlTicket(event, foundEventArea, foundChair, founDayEvent, timeEvent, qrImageData);
            const pdfBuffer = await PDFticket(htmlContent, page);
            const imgTicket = await IMGticket(htmlContent, page);
            let urlTicket;
            const dataImgAfterUpload = upLoadImg(imgTicket, "Tickets");
            urlTicket = (await dataImgAfterUpload).urlImage;
            //Ghi thông tin người mua vào ghế
            const dataChair = writeIdClientToChair(_idClient, chairId);
            finalDataChair = (await dataChair).writeToChair;

            tickets.push({
                chair_id: chairId,
                classTicket: foundEventArea,
                chairName: foundChair.chair_name,
                ticket_price: ticket_price,
                ticket: urlTicket
            });
            buffers.push(pdfBuffer);
        }
        //_idEvent
        const order = await Order.findOne({ event_id: _idEvent });
        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Order not found for the event.',
            });
        }
        //update ngày và địa điểm sự kiện
        order.event_date = founDayEvent;
        order.event_location = event.event_location.city;
        // Thêm orderDetail mới vào mảng Orders
        const orderDetailData = {
            client_id: _idClient,
            totalAmount: totalAmount,
            zp_trans_id: zp_trans_id,
            tickets: tickets,
        }

        order.Orders.push(orderDetailData);

        await order.save();

        await sendTicketByEmail(email, client, buffers);
        // Đóng trình duyệt
        await browser.close();
        res.status(200).json({ status: true, message: 'Tickets created and sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: createTicketPDF
## Describe: Tạo vé PDF
## Params: event, _idChair, qrImageData, page
## Result: pdfBuffer
===============================*/
async function PDFticket(htmlContent, page) {
    // Set nội dung HTML vào trang
    await page.setContent(htmlContent);

    // Chuyển đổi trang HTML thành PDF
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return pdfBuffer;
}

async function IMGticket(htmlContent, page) {
    // Set nội dung HTML vào trang
    await page.setContent(htmlContent);
    // Tạo ảnh màn hình từ nội dung HTML
    const imageBuffer = await page.screenshot({ encoding: 'base64', type: 'png', fullPage: true });

    return `data:image/png;base64,${imageBuffer}`;
}

module.exports = {
    createTicket,
};
