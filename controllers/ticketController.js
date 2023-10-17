const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');
const Event = require('../model/eventModels');
const Client = require('../model/clientsModel');

/*=============================
## Name function: writeIdClientToChair
## Describe: Ghi idClient vào ghế
## Params: _idClient, _idChair
## Result: data: writeToChair
===============================*/
async function writeIdClientToChair(_idClient, _idChair) {
    // Tìm và ghi thông tin của người mua vào ghế ngồi
    const writeToChair = await Event.findOneAndUpdate(
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
    return {
        writeToChair
    }
}

/*=============================
## Name function: foundChairAndArea
## Describe: Xác định ngày, khu vực ghế ngồi trong sự kiện
## Params: event, _idArea, _idChair
## Result: data: foundDayNumber, foundEventArea, foundChair
===============================*/
async function foundChairAndArea(event, _idArea, _idChair) {
    let foundEventArea = null;
    let foundChair = null;
    let foundDayNumber = null;
    let founDayEvent = null;

    event.event_date.forEach((date) => {
        //Xác định thứ tự ngày diễn ra sự kiện
        foundDayNumber = date.day_number;
        //xác định ngày diễn ra sự kiện
        founDayEvent = date.date.toString().split('GMT')[0].trim();//tách xóa chữ múi giờ Đông Dương
        //Xác định khu vực sự kiện
        const area = date.event_areas.find((a) => a._id.toString() === _idArea);
        if (area) {
            foundEventArea = area;
        }
        //Xác định vị trí ghế
        date.event_areas.forEach((area) => {
            area.rows.forEach((row) => {
                const chair = row.chairs.find((c) => c._id.toString() == _idChair);
                if (chair) {
                    foundChair = chair;
                }
            });
        });
    });
    return { foundDayNumber, founDayEvent, foundEventArea, foundChair }
}

/*=============================
## Name function: createEventTicketPDF
## Describe: Tạo tệp PDF chứa vé sự kiện và mã QR code
## Params: _idClient, _idEvent, _idChair
## Result: status, message, ticket to email
===============================*/
async function createEventTicket(req, res) {
    try {
        const { _idClient } = req.body;
        const { _idEvent, _idArea, _idChair } = req.body.event;
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

        // Kiểm tra sự tồn tại của ghế
        const chair = await Event.findOne({
            _id: _idEvent,
            "event_date.event_areas.rows.chairs._id": _idChair
        });
        if (!chair) {
            return res.status(400).json({
                status: false,
                message: 'Ghế không tồn tại',
            });
        }
        //Tìm khu vực và ghế sự kiện
        const foundChairAndAreaForEvent = foundChairAndArea(event, _idArea, _idChair);
        //Ghi thông tin người mua vào ghế
        const dataChair = writeIdClientToChair(_idClient, _idChair);
        finalDataChair = (await dataChair).writeToChair;
        // Tạo tệp PDF
        const doc = new PDFDocument();
        // Thêm thông tin sự kiện
        doc.fontSize(16).text('TICKETS TO THE EVENT', { underline: true });
        doc.fontSize(12).text(`Event name: ${event.event_name}`);
        doc.fontSize(12).text(`Event type: ${event.type_of_event}`);
        doc.fontSize(12).text(`Event Date: ${(await foundChairAndAreaForEvent).founDayEvent}`);
        // Thêm thông tin ghế
        doc.moveDown();
        doc.fontSize(16).text('Seat information:', { underline: true });
        doc.fontSize(12).text(`Ticket area: ${(await foundChairAndAreaForEvent).foundEventArea.name_areas}`);
        doc.fontSize(12).text(`Chair name: ${(await foundChairAndAreaForEvent).foundChair.chair_name}`);

        // Tạo mã QR với các ID tương ứng
        const qrData = {
            userId: _idClient,
            eventId: _idEvent,
            dayEvent: (await foundChairAndAreaForEvent).foundDayNumber,
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
        // Ghi tệp PDF vào file 'TikSeat.pdf'
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
                    res.json({ status: true, message: 'Gửi Ticket thành công' });
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