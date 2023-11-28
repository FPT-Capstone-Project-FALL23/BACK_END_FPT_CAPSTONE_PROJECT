const Client = require("../model/clientsModel");
const Event = require("../model/eventModels");
const Order = require("../model/orderModel");
const Organizer = require("../model/organizersModels");
const RefundOrder = require("../model/refundOrderModel");
const User = require("../model/usersModel");
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');

/*=============================
## Name function: getAllClients
## Describe: Lấy thông tin của toàn bộ client
## Params: none
## Result: status, message, data
===============================*/
async function getAllClients(req, res) {
    try {
        const clients = await User.find({ role: 'client' }, 'email password')
            .sort({ registration_date: -1 })
            .exec();

        if (!clients || clients.length === 0) {
            return res.status(404).json({ message: 'No clients found' });
        }

        const clientIds = clients.map(client => client._id);

        const clientInfo = await Client.find({ user_id: { $in: clientIds } }).exec();

        if (!clientInfo || clientInfo.length === 0) {
            return res.status(404).json({ message: 'No client information found' });
        }

        const clientsWithInfo = clients.map(client => {
            const clientData = client.toObject();
            const userInfo = clientInfo.find(info => info.user_id.equals(client._id));
            clientData.additionalInfo = userInfo;
            return clientData;
        });

        // Format the response
        const formattedClients = clientsWithInfo.map(client => ({
            _id: client._id,
            email: client.email,
            full_name: client.additionalInfo?.full_name,
            phone: client.additionalInfo?.phone,
            age: calculateAge(client.additionalInfo?.birthday),
            gender: client.additionalInfo?.gender,
        }));
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedClients
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: calculateAge
## Describe: Hàm tính tuổi dựa trên ngày sinh
## Params: birthdate
## Result: age
===============================*/
function calculateAge(birthdate) {
    const today = new Date();
    const birthdateDate = new Date(birthdate);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
        age--;
    }

    return age;
}

/*=============================
## Name function: getDetailClient
## Describe: lấy thông tin của _id client
## Params: _idUser
## Result: status, message, data
===============================*/
async function getDetailClient(req, res) {
    try {
        const { _idUser } = req.body;
        const user = await User.findById(_idUser).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const client = await Client.findOne({ user_id: _idUser }).exec();

        if (!client) {
            return res.status(404).json({ message: 'Client information not found for this user' });
        }

        // Combine the user and client information
        const detailedClientInfo = {
            user_id: user._id,
            email: user.email,
            full_name: client?.full_name,
            phone: client?.phone,
            birthday: client?.birthday.toISOString().split('T')[0],
            gender: client?.gender,
            avatarImage: client?.avatarImage,
            purchased_tickets: client?.purchased_tickets,
            favorit_enres: client?.favorit_enres,
            age: calculateAge(client?.birthday)
        };
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: detailedClientInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getAllOrganizers
## Describe: Lấy thông tin của toàn bộ Organizer
## Params: none
## Result: status, message, data
===============================*/
async function getAllOrganizers(req, res) {
    try {
        const organizersInfo = await Organizer.find({ isActive: true }).exec();

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersIds = organizersInfo.map(organizer => organizer.user_id);

        const organizers = await User.find({ _id: { $in: organizersIds } }, 'email').exec();

        if (!organizers || organizers.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersWithInfo = organizers.map(organizer => {
            const organizerData = {};
            const userInfo = organizersInfo.find(info => info.user_id.equals(organizer._id));
            organizerData._id = organizer._id;
            organizerData.email = organizer.email;
            organizerData.additionalInfo = userInfo;
            return organizerData;
        });

        // Format the response
        const formattedOrganizers = organizersWithInfo.map(organizer => ({
            _id: organizer._id,
            email: organizer.email,
            organizer_name: organizer.additionalInfo?.organizer_name,
            phone: organizer.additionalInfo?.phone,
            founded_date: organizer.additionalInfo?.founded_date.toISOString().split('T')[0],
            website: organizer.additionalInfo?.website,
            isActive: organizer.additionalInfo?.isActive,
        }));

        // Handle success
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedOrganizers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getDetailOrganizer
## Describe: lấy thông tin của _id Organizer
## Params: _idUser
## Result: status, message, data
===============================*/
async function getDetailOrganizer(req, res) {
    try {
        const { _idUser } = req.body;
        const user = await User.findById(_idUser).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const organizer = await Organizer.findOne({ user_id: _idUser }).exec();

        if (!organizer) {
            return res.status(404).json({ message: 'Client information not found for this user' });
        }

        // Combine the user and client information
        const detailedOrganizerInfo = {
            user_id: user._id,
            email: user.email,
            organizer_name: organizer?.organizer_name,
            phone: organizer?.phone,
            founded_date: organizer?.founded_date.toISOString().split('T')[0],
            description: organizer?.description,
            avatarImage: organizer?.avatarImage,
            address: organizer?.address,
            organizer_type: organizer?.organizer_type,
            isActive: organizer?.isActive,
            website: organizer?.website,
        };
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: detailedOrganizerInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: setIsActiveOrganizer
## Describe: Phê duyệt khi Organizer đăng nhập
## Params: _idUser
## Result: status, message, data
===============================*/
async function setIsActiveOrganizer(req, res) {
    try {
        const { _idUser } = req.body;
        const organizer = await Organizer.findOneAndUpdate({ user_id: _idUser }, { isActive: true }, { new: true })
        if (!organizer) {
            return res.status(404).json({ error: 'Organizer not found' });
        }
        const user = await User.findById(_idUser);
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'User does not exist',
            });
        }
        const email = user.email;
        await sendEmailActiveOrganizer(email);
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: organizer
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}
async function sendEmailActiveOrganizer(email) {
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: ACCOUNT HAS BEEN ACTIVATED',
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
                                                                    Hello ${email},</h1>
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Your account has been activated.</span></span>
                                                                </p>
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Now, log in and start your journey with us, creating amazing events!</span></span>
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
    };
    // Gửi email
    sendMailToUser(mailOptions)
}
/*=============================
## Name function: setIsActiveEvent
## Describe: Phê duyệt khi Organizer tạo Event
## Params: _idEvent
## Result: status, message, data
===============================*/
async function setIsActiveEvent(req, res) {
    try {
        const { _idEvent, isHot } = req.body;
        let event;
        if (isHot) {
            event = await Event.findByIdAndUpdate(_idEvent, { isActive: true, isHot: true }, { new: true })
        } else {
            event = await Event.findByIdAndUpdate(_idEvent, { isActive: true }, { new: true })
        }
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const _idOrganizer = event.organizer_id;
        const organizer = await Organizer.findById(_idOrganizer);
        if (!organizer) {
            return res.status(400).json({
                status: false,
                message: 'Organizer does not exist',
            });
        }
        const _idUser = organizer.user_id;
        const user = await User.findById(_idUser);
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'User does not exist',
            });
        }
        const email = user.email;
        await sendEmailActiveEvent(email, organizer, event);
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: event
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}
async function sendEmailActiveEvent(email, organizer, event) {
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: EVENT HAS BEEN ACTIVATED',
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
                                                                    Hello ${organizer.organizer_name},</h1>
        
                                                                <h1
                                                                    style="color: #222222; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 30px; font-size: 20px; text-align: center; ">
                                                                    YOUR EVENT HAS BEEN ACTIVATED</h1>
        
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Congratulations, you have successfully created the event ${event.event_name}.</span></span>
                                                                </p>
                                                                <p><span style="color: #993300"><span
                                                                            style="background-color: #ffffff">Your event is an opportunity to create beautiful memories and connect the community. Start preparing well for your event now!</span></span>
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
    };
    // Gửi email
    sendMailToUser(mailOptions)
}
/*=============================
## Name function: setIsHotEvent
## Describe: Xét độ Hot khi Organizer tạo Event
## Params: _idEvent
## Result: status, message, data
===============================*/
async function setIsHotEvent(req, res) {
    try {
        const { _idEvent } = req.body;
        const event = await Event.findByIdAndUpdate(_idEvent, { isHot: true }, { new: true })
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: event
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getAllOrganizersIsAtivecFalse
## Describe: Lấy thông tin của toàn bộ Organizer voiws isActive is False
## Params: none
## Result: status, message, data
===============================*/
async function getAllOrganizersIsActiveFalse(req, res) {
    try {
        const organizersInfo = await Organizer.find({ isActive: false }).exec();

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersIds = organizersInfo.map(organizer => organizer.user_id);

        const organizers = await User.find({ _id: { $in: organizersIds } }, 'email').exec();

        if (!organizers || organizers.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersWithInfo = organizers.map(organizer => {
            const organizerData = {};
            const userInfo = organizersInfo.find(info => info.user_id.equals(organizer._id));
            organizerData._id = organizer._id;
            organizerData.email = organizer.email;
            organizerData.additionalInfo = userInfo;
            return organizerData;
        });

        // Format the response
        const formattedOrganizers = organizersWithInfo.map(organizer => ({
            _id: organizer._id,
            avatarImage: organizer.additionalInfo?.avatarImage,
            email: organizer.email,
            organizer_name: organizer.additionalInfo?.organizer_name,
            phone: organizer.additionalInfo?.phone,
            founded_date: organizer.additionalInfo?.founded_date.toISOString().split('T')[0],
            website: organizer.additionalInfo?.website,
            address: getAddressString(organizer.additionalInfo?.address),
            organizer_type: organizer.additionalInfo?.organizer_type,
            description: organizer.additionalInfo?.description,
        }));

        // Handle success
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedOrganizers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getAddressString
## Describe: hàm trả về address
## Params: address
## Result: addressString
===============================*/
function getAddressString(address) {
    if (!address) return '';

    const { city, district, ward, specific_address } = address;
    let addressString = '';
    if (specific_address) addressString += specific_address + ', ';
    if (ward) addressString += ward + ', ';
    if (district) addressString += district + ', ';
    if (city) addressString += city;

    return addressString;
}

/*=============================
## Name function: getAllEventIsAtivecFalse
## Describe: Lấy thông tin của toàn bộ Event với isActive là False
## Params: none
## Result: status, message, data
===============================*/
async function getAllEventIsActiveFalse(req, res) {
    try {
        // Find all events with isActive set to false
        const events = await Event.find({ isActive: false }).populate('organizer_id', 'organizer_name');;

        const formattedEvent = events.map(event => ({
            _id: event._id,
            event_name: event.event_name,
            organizer_name: event.organizer_id.organizer_name,
            type_of_event: event.type_of_event,
            event_location: getAddressString(event.event_location),
        }))
        // Handle success
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedEvent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getDetailClient
## Describe: lấy thông tin của _id client
## Params: _idEvent
## Result: status, message, data
===============================*/
async function getDetailEventActiveIsFalse(req, res) {
    try {
        const { _idEvent } = req.body;
        // Find the event by its _id
        const event = await Event.findById(_idEvent).populate('organizer_id', 'organizer_name');

        if (!event) {
            // Event not found
            return res.status(404).json({ message: 'Event not found' });
        }

        // Create formattedEvent object with required fields
        const formattedEvent = {
            _id: event._id,
            event_name: event.event_name,
            organizer_name: event.organizer_id.organizer_name,
            type_of_event: event.type_of_event,
            eventImage: event.eventImage,
            type_layout: event.type_layout,
            maxTicketInOrder: event.maxTicketInOrder,
            event_description: event.event_description,
            isHot: event.isHot,
            create_date: event.create_date.toISOString().split('T')[0],
            sales_date: event.sales_date,
            event_date: event.event_date
        };
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedEvent
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: calculateTotalAmountAndAdminEarnings
## Describe: tính tổng tiền đã bán và đaonh thủ của Admin
## Params: events
## Result: totalAmountSold
===============================*/
function calculateTotalAmountAndAdminEarnings(events) {

    let totalAmountSold = 0;
    let adminEarnings = 0;

    events.forEach(event => {
        event.event_date.forEach(date => {
            date.event_areas.forEach(area => {
                area.rows.forEach(row => {
                    row.chairs.forEach(chair => {
                        if (chair.isBuy) {
                            totalAmountSold += row.ticket_price;
                            formatAmountSold = formatMoney(totalAmountSold);
                            const onePercentSeatsSold = row.ticket_price * 0.01;
                            //quản trị viên kiếm được 1% giá vé cho mỗi ghế được bán
                            adminEarnings += onePercentSeatsSold;
                            formatAdminEarnings = formatMoney(adminEarnings);
                            console.log(`Admin Earnings from 1% Seats Sold: ${adminEarnings}`);
                            console.log(`Total Amount Sold: ${totalAmountSold}`);
                        }
                    });
                });
            });
        });
    });
    return { formatAmountSold, formatAdminEarnings }
}

/*=============================
## Name function: getTotalAmountSoldAllEventAndAdminEarnings
## Describe: tổng tiền đã bán của tất cả sự kiện
## Params: none
## Result: status, message, data
===============================*/
async function getTotalAmountSoldAllEventAndAdminEarnings(req, res) {
    try {
        const events = await Event.find({ isActive: true });
        const refundOrders = await RefundOrder.find({ refunded: true });

        const totalAmount = calculateTotalAmountAndAdminEarnings(events);
        const totalRefund = calculateTotalMoneyRefunded(refundOrders);
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            totalAmount,
            totalRefund
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

function calculateTotalMoneyRefunded(refundOrders) {
    let totalMoneyRefunded = 0;
    let ActualFare = 0;

    refundOrders.forEach(refundOrder => {
        totalMoneyRefunded += refundOrder.money_refund;
        formatMoneyRefund = formatMoney(totalMoneyRefunded);
        ActualFare = (totalMoneyRefunded * 100) / 70;
        AdminEarRefund = formatMoney((ActualFare * 15) / 100);
    });
    console.log(`Total Money Refunded: ${totalMoneyRefunded}`);
    console.log(`percentage Of Payment: ${ActualFare}`);
    console.log(`AdminEarRefund: ${AdminEarRefund}`);
    return { formatMoneyRefund, AdminEarRefund }
}

/*=============================
## Name function: formatMoney
## Describe: chuyển số thành tiền (Vd:10000 => 10,000)
## Params: amount
## Result: formattedAmount
===============================*/
function formatMoney(amount) {
    const formattedAmount = amount.toLocaleString();
    return formattedAmount;
}

/*=============================
## Name function: getAllOrders
## Describe: lấy tất cả các đơn đặt hàng, tính tổng số tiền và đếm giao dịch
## Params: none
## Result: status, message, data
===============================*/
async function getAllOrders(req, res) {
    try {
        const orders = await Order.find();
        const totalTransactionAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const count = orders.length;


        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const client = await getMailOfClient(order.client_id)
            return {
                totalAmount: formatMoney(order.totalAmount),
                event_date: order.event_date.toISOString().split('T')[0],
                transaction_date: order.transaction_date.toISOString().split('T')[0],
                event_name: order.event_name,
                zp_trans_id: order.zp_trans_id,
                numberOfTickets: order.tickets.length,
                client_name: client.fomatInfoClient.full_name,
                client_email: client.fomatInfoClient.email
            }
        }));

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalTransactionAmount: formatMoney(totalTransactionAmount),
                count: count,
                orders: formattedOrders
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getMailOfClient
## Describe: lấy name và email
## Params: user_id
## Result: fomatInfoClient
===============================*/
async function getMailOfClient(user_id) {
    const client = await Client.findById(user_id);
    const user = await User.findById(client.user_id);
    const fomatInfoClient = {
        full_name: client.full_name,
        email: user.email
    }
    return { fomatInfoClient };
}

module.exports = {
    getAllClients,
    getDetailClient,
    getAllOrganizers,
    getDetailOrganizer,
    setIsActiveOrganizer,
    setIsActiveEvent,
    setIsHotEvent,
    getAllOrganizersIsActiveFalse,
    getAllEventIsActiveFalse,
    getDetailEventActiveIsFalse,
    getTotalAmountSoldAllEventAndAdminEarnings,
    calculateTotalMoneyRefunded,
    getAllOrders,
    getMailOfClient,
    formatMoney
}