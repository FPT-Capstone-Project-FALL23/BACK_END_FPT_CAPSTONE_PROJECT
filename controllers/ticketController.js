const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { upLoadImg } = require('../controllers/authController');
const Client = require('../model/clientsModel');
const Order = require('../model/orderModel');
const Event = require('../model/eventModels');
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');
const { checkZaloPayment } = require('../zalopay/payment');

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
                founDayEvent = date.date.toString().split('GMT')[0].trim();//tách xóa chữ múi giờ Đông Dương
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
            const htmlContent = await htmlTicket(event, foundEventArea, foundChair, founDayEvent, qrImageData);
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
        const order = new Order({
            client_id: _idClient,
            event_id: _idEvent,
            event_name: event.event_name,
            event_date: founDayEvent,
            event_location: event.event_location.city,
            totalAmount: totalAmount,
            zp_trans_id: zp_trans_id,
            tickets: tickets,
        });
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
async function htmlTicket(event, foundEventArea, foundChair, founDayEvent, qrImageData) {
    const htmlContent = `<!DOCTYPE html>
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
            width: 600px;
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
    
        img {
            height: 300px;
            width: 300px;
        }
    </style>
    
    <body>
        <div class="ticket">
            <div class="header">
                <h1>TikSeat</h1>
            </div>
            <div class="content">
                <P>Event Name: ${event.event_name}</p>
                <p>Date: ${founDayEvent}</p>
                <p>Location: ${event.event_location.specific_address} - ${event.event_location.ward} -
                    ${event.event_location.district} - ${event.event_location.city}</p>
                <p>Class Ticket: <span style="font-size: 20px; font-weight: 600;">${foundEventArea}</span></p>
                <p>Seat: <span style="font-size: 20px; font-weight: 600;">${foundChair.chair_name}</span></p>
            </div>
            <div class="qr-code">
                <img src="${qrImageData}" alt="QR Code">
            </div>
            <h3 style="color: red;">Attention</h3>
            <div style="display: flex; align-items: start; flex-direction: column; padding-left: 20px;">
                <p>1. Give the QR code to the staff to scan the code to check in to the event</p>
                <p>2. Tickets can be refunded 24 hours before the event starts</p>
                <p>3. Tickets are only valid for one-time use</p>
                <p>4. Do not share tickets with anyone</p>
            </div>
        </div>
    </body>
    
    </html>`;

    return htmlContent;
}

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

/*=============================
## Name function: sendTicketByEmail
## Describe: Gửi vé đến email
## Params: email, client, buffers
## Result: 
===============================*/
async function sendTicketByEmail(email, client, buffers) {
    // Nội dung email
    const mailOptions = {
        from: AUTH_EMAIL, // Thay thế bằng email của bạn
        to: email,
        subject: 'TIKSEAT: MUA VÉ THÀNH CÔNG',
        html:
            `
        <html>
        
        <head>
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <title>Your ticket</title>
            <style media="all" type="text/css">
                @media only screen and (max-width: 620px) {
        
                    .span-2,
                    .span-3 {
                        max-width: none !important;
                        width: 100% !important;
                    }
        
                    .span-2>table,
                    .span-3>table {
                        max-width: 100% !important;
                        width: 100% !important;
                    }
                }
        
                @media all {
                    .btn-primary table td:hover {
                        background-color: #34495e !important;
                    }
        
                    .btn-primary a:hover {
                        background-color: #34495e !important;
                        border-color: #34495e !important;
                    }
                }
        
                @media all {
                    .btn-secondary a:hover {
                        border-color: #34495e !important;
                        color: #34495e !important;
                    }
                }
        
                @media only screen and (max-width: 620px) {
                    h1 {
                        font-size: 28px !important;
                        margin-bottom: 10px !important;
                    }
        
                    h2 {
                        font-size: 22px !important;
                        margin-bottom: 10px !important;
                    }
        
                    h3 {
                        font-size: 16px !important;
                        margin-bottom: 10px !important;
                    }
        
                    p,
                    ul,
                    ol,
                    td,
                    span,
                    a {
                        font-size: 16px !important;
                    }
        
                    .wrapper,
                    .article {
                        padding: 10px !important;
                    }
        
                    .content {
                        padding: 0 !important;
                    }
        
                    .container {
                        padding: 0 !important;
                        width: 100% !important;
                    }
        
                    .header {
                        margin-bottom: 10px !important;
                    }
        
                    .main {
                        border-left-width: 0 !important;
                        border-radius: 0 !important;
                        border-right-width: 0 !important;
                    }
        
                    .btn table {
                        width: 100% !important;
                    }
        
                    .btn a {
                        width: 100% !important;
                    }
        
                    .img-responsive {
                        height: auto !important;
                        max-width: 100% !important;
                        width: auto !important;
                    }
        
                    .alert td {
                        border-radius: 0 !important;
                        padding: 10px !important;
                    }
        
                    .receipt {
                        width: 100% !important;
                    }
                }
        
                @media all {
                    .ExternalClass {
                        width: 100%;
                    }
        
                    .ExternalClass,
                    .ExternalClass p,
                    .ExternalClass span,
                    .ExternalClass font,
                    .ExternalClass td,
                    .ExternalClass div {
                        line-height: 100%;
                    }
        
                    .apple-link a {
                        color: inherit !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        text-decoration: none !important;
                    }
                }
            </style>
        </head>
        
        <body
            style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
            <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
                width="100%">
                <tbody>
                    <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                        <td class="container"
                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                            valign="top" width="580">
                            <div class="content"
                                style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                                <!-- START CENTERED WHITE CONTAINER -->
        
                                <table class="main"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                    width="100%"><!-- START MAIN CONTENT AREA -->
                                    <tbody>
                                        <tr>
                                            <td class="wrapper"
                                                style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                                valign="top">
                                                <table border="0" cellpadding="0" cellspacing="0"
                                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                    width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                                valign="top">
                                                                <h1
                                                                    style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                    Chào ${client.full_name},</h1>
        
                                                                <h1
                                                                    style="color: #222222; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 30px; font-size: 20px; text-align: center; ">
                                                                    BẠN ĐÃ MUA VÉ THÀNH CÔNG</h1>
        
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Chúc mừng bạn đã mua vé thành công! Vui lòng chuẩn bị sẵn vé tại nơi soát vé. </span></span>
                                                                </p>
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Vé sẽ được đính kèm trong email này</span></span>
                                                                </p>
                                                                &nbsp;
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <!-- END MAIN CONTENT AREA -->
                                    </tbody>
                                </table>
                                <!-- START FOOTER -->
        
                                <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0"
                                        style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td align="center" class="content-block powered-by"
                                                    style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                    valign="top">Powered by <a href="#"
                                                        style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                            </div>
                        </td>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </body>
        
        </html>
        `,
        attachments: buffers.map((pdf, index) => ({
            filename: `TIKSEAT_ticket_${index + 1}.pdf`,
            content: pdf,
            encoding: 'base64',
        })),
    };

    // Gửi email
    sendMailToUser(mailOptions)
}

module.exports = {
    createTicket,
};
