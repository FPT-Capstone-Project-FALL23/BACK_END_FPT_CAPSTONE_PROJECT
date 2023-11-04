const QRCode = require('qrcode');
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

async function createTicket(_idClient, email, event, chairIds) {
    try {
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
            
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}




module.exports = {
    createTicket
}