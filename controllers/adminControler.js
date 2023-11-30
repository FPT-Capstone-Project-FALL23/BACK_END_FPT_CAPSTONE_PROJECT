const { htmlMailActiveEvent, htmlMailActiveOrganizer } = require("../config/constHTML");
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
            avatarImage: client.additionalInfo?.avatarImage
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
## Name function: blockedUser
## Describe: Block user
## Params: _idUser
## Result: status, message, data
===============================*/
async function blockedUser(req, res) {
    try {
        const { _idUser } = req.body;
        const user = await User.findOneAndUpdate(
            { _id: _idUser },
            { $set: { isBlocked: true } },
            { new: true }
        );
        user.isBlocked = !user.isBlocked;
        res.status(200).json({
            status: true,
            message: 'success',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
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
            birthday: formatDate(client?.birthday),
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
            founded_date: formatDate(organizer.additionalInfo?.founded_date),
            website: organizer.additionalInfo?.website,
            isActive: organizer.additionalInfo?.isActive,
            avatarImage: organizer.additionalInfo?.avatarImage
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
            founded_date: formatDate(organizer?.founded_date),
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

/*=============================
## Name function: sendEmailActiveOrganizer
## Describe: Gửi mail cho tổ chức khi phê duyệt
## Params: email
## Result: none
===============================*/
async function sendEmailActiveOrganizer(email) {
    const htmlActive = htmlMailActiveOrganizer(email)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: ACCOUNT HAS BEEN ACTIVATED',
        html: htmlActive,
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

/*=============================
## Name function: sendEmailActiveEvent
## Describe: Gửi mail cho tổ chức khi phê duyệt event
## Params: email, organizer, event
## Result: none
===============================*/
async function sendEmailActiveEvent(email, organizer, event) {
    const htmlEmail = htmlMailActiveEvent(organizer, event)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: EVENT HAS BEEN ACTIVATED',
        html: htmlEmail,
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
            founded_date: formatDate(organizer.additionalInfo?.founded_date),
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
            create_date: formatDate(event.create_date),
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
## Result: formatAmountSold, formatAdminEarnings
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
        const { startDate, endDate } = req.body;
        const events = await Event.find({ isActive: true });
        const refundOrders = await RefundOrder.find({ refunded: true });

        const totalAmount = calculateTotalAmountAndAdminEarnings(events);
        const totalRefund = calculateTotalMoneyRefunded(refundOrders);
        const calculateDaily = await calculateDailyStats(startDate, endDate);

        const fomatData = {
            totalAmountSold: totalAmount.formatAmountSold,
            totalAdminEarnings: totalAmount.formatAdminEarnings,
            totalMoneyRefund: totalRefund.formatMoneyRefund,
            totalAdminEarRefund: totalRefund.adminEarRefund,
            calculateDailyStats: calculateDaily
        }
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: fomatData
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: calculateTotalMoneyRefunded
## Describe: tính tổng số tiền được hoàn lại
## Params: refundOrders
## Result: formatMoneyRefund, adminEarRefund
===============================*/
function calculateTotalMoneyRefunded(refundOrders) {
    let totalMoneyRefunded = 0;
    let ActualFare = 0;

    refundOrders.forEach(refundOrder => {
        totalMoneyRefunded += refundOrder.money_refund;
        formatMoneyRefund = formatMoney(totalMoneyRefunded);
        ActualFare = (totalMoneyRefunded * 100) / 70;
        adminEarRefund = formatMoney((ActualFare * 15) / 100);
    });
    return { formatMoneyRefund, adminEarRefund }
}

/*=============================
## Name function: calculateDailyStats
## Describe: tính toán số liệu thống kê hàng ngày
## Params: startDate, endDate
## Result: dailyStats
===============================*/
async function calculateDailyStats(startDate, endDate) {
    const orders = await Order.find({
        transaction_date: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }
    }, 'transaction_date totalAmount');

    const dailyStats = {};

    orders.forEach((order) => {
        const date = formatDate(order.transaction_date);

        if (!dailyStats[date]) {
            dailyStats[date] = {
                totalAmount: 0,
                transactionCount: 0
            };
        }

        dailyStats[date].totalAmount += order.totalAmount;
        dailyStats[date].transactionCount += 1;
    });

    return dailyStats;
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
## Name function: formatDate
## Describe: format lại ngày
## Params: date
## Result: formattedDate
===============================*/
function formatDate(date) {
    const formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
}

/*=============================
## Name function: getAllOrders
## Describe: lấy tất cả các đơn đặt hàng, tính tổng số tiền và đếm giao dịch
## Params: none
## Result: status, message, data
===============================*/
async function getAllOrders(req, res) {
    try {
        const orders = await Order.find()
            .sort({ transaction_date: -1 });
        const totalTransactionAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const count = orders.length;


        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const client = await getMailOfClient(order.client_id)
            return {
                totalAmount: formatMoney(order.totalAmount),
                event_date: formatDate(order.event_date),
                transaction_date: formatDate(order.transaction_date),
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
    formatMoney,
    blockedUser,
    formatDate
}