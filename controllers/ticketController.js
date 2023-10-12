const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');
const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');

/*=============================
## Name function: createEventTicketPDF
## Describe: Tạo tệp PDF chứa vé sự kiện và mã QR code
## Params: _idClient, _idEvent, _idChair
## Result: status, message, ticket to email
===============================*/
async function createEventTicket(req, res) {
    try {
        const { _idClient } = req.body;
        const { _idEvent, _idChair } = req.body.event;
        const { email } = req.body;

        //Kiểm tra _id có tồn tại trong user
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: "Người dùng chưa có",
            });
        }

        // Kiểm tra sự tồn tại của sự kiện
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Sự kiện không tồn tại',
            });
        }

        const chair = await Event.findOne({ "event_date.event_areas.rows.chairs._id": _idChair });
        if (!chair) {
            return res.status(400).json({
                status: false,
                message: 'Ghế không tồn tại',
            });
        }

        // Tạo tệp PDF
        const doc = new PDFDocument();
        // Thêm thông tin sự kiện
        doc.fontSize(16).text('TICKETS TO THE EVENT', { underline: true });
        doc.fontSize(12).text(`Event name: ${event.event_name}`);
        doc.fontSize(12).text(`Event type: ${event.type_of_event}`);
        // Thêm thông tin ghế
        doc.moveDown();
        doc.fontSize(16).text('Seat information:', { underline: true });
        doc.fontSize(12).text(`Ticket area: ${event.event_date[0].event_areas[0].name_areas}`);
        doc.fontSize(12).text(`Chair name: ${event.event_date[0].event_areas[0].rows[0].chairs[0].chair_name}`);

        // Tạo mã QR với các ID tương ứng
        const qrData = {
            userId: _idClient,
            eventId: _idEvent,
            chairId: _idChair
        };
        const qrOptions = {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            margin: 1,
            width: 120,
            quality: 0.8
        };
        const qrImageData = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions);
        // Thêm hình ảnh mã QR vào tệp PDF
        doc.moveDown();
        doc.fontSize(16).text('Mã QR:', { underline: true });
        doc.image(qrImageData, { width: 200 });

        // Thêm thông tin sự kiện và ghế vào tệp PDF...

        // Ghi tệp PDF vào file 'ticket.pdf'
        doc.pipe(fs.createWriteStream('TikSeat.pdf')).on('finish', () => {
            // Đọc nội dung của tệp PDF
            const fileData = fs.readFileSync('TikSeat.pdf');
            // Chuẩn bị các tùy chọn đính kèm email
            const attachments = [
                {
                    filename: 'TikSeat.pdf',
                    content: fileData,
                    contentType: 'application/pdf'
                }
            ];

            // Tạo đối tượng mailOptions với các thông tin cần thiết
            const mailOptions = {
                from: AUTH_EMAIL,
                to: email,
                subject: 'TIKSEAT: MUA VÉ THÀNH CÔNG',
                html: `
                    <html>
                    <body>
                        <h3>Xin chào, ${client.full_name}</h3>
                        <p>Dưới đây là mã QR của bạn:</p>
                    </body>
                    </html>
                `,
                attachments: attachments
            };

            // Gửi email
            sendMailToUser(mailOptions)
                .then(() => {
                    res.json({ status: true, message: 'Gửi thành công' });
                })
                .catch((error) => {
                    res.json({ status: false, message: 'Lỗi khi gửi Ticket' });
                });
        });

        // Kết thúc việc ghi tệp PDF
        doc.end();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createEventTicket
}