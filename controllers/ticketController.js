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
            "event_date.event_areas._id": _idArea,
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
        // Tạo đối tượng mailOptions với các thông tin cần thiết
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject: 'TIKSEAT: MUA VÉ THÀNH CÔNG',
            html: `
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
            
                                                                    <p
                                                                        style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
                                                                        Tên sự kiện: ${event.event_name} </p>
            
                                                                    <p
                                                                        style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
                                                                        Loại vé: ${(await foundChairAndAreaForEvent).foundEventArea.name_areas} | Ghế ngồi: ${(await foundChairAndAreaForEvent).foundChair.chair_name} </p>
            
                                                                    <p
                                                                        style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
                                                                        Địa điểm: ${event.event_location.specific_address}, ${event.event_location.ward}, ${event.event_location.district}, ${event.event_location.city} </p>
            
                                                                    <p
                                                                        style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
                                                                        Thời gian: ${(await foundChairAndAreaForEvent).founDayEvent} </p>
            
                                                                    <p><span style="color: #993300"><span
                                                                                style="background-color: #ffffff">Chúc mừng bạn đã mua vé thành công! Vui lòng chuẩn bị sẵn vé tại nơi soát vé. </span></span>
                                                                    </p>
                                                                    <div style=" Margin-top: 2px; width: 100%;">
                                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                                            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; min-width: 100%;"
                                                                            width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td align="center" class="align-center">
                                                                                        <img src="cid:qrcode" alt="QR Code" style="width: 50vh; max-width: 100%;">
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
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
            attachments: [
                {
                    filename: "qrcode.png",
                    content: qrImageData.split(",")[1],
                    encoding: "base64",
                    cid: "qrcode",
                },
            ],
        };

        // Gửi email
        sendMailToUser(mailOptions)
            .then(() => {
                res.json({ status: true, message: 'Gửi Ticket thành công' });
            })
            .catch((error) => {
                res.json({ status: false, message: 'Lỗi khi gửi Ticket' });
            });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createEventTicket
}