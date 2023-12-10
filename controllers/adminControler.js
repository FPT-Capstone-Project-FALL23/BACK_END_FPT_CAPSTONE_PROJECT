const { sendEmailActiveOrganizer, sendEmailActiveEvent } = require("../controllers/emailController");
const Client = require("../model/clientsModel");
const Event = require("../model/eventModels");
const Order = require("../model/orderModel");
const Organizer = require("../model/organizersModels");
const PayBusiness = require("../model/payBusinessModel");
const RefundOrder = require("../model/refundOrderModel");
const User = require("../model/usersModel");
const { calculateTotalRevenue, calculateExpectedAmount } = require("./eventController");

/*=============================
## Name function: getAllClients
## Describe: Lấy thông tin của toàn bộ client
## Params: page
## Result: status, message, data
===============================*/
async function getAllClients(req, res) {
    try {
        const { page } = req.body;
        const clientsCount = await User.countDocuments({ role: 'client' });

        const limit = 5; // Number of clients per page
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, clientsCount);

        const clients = await User.find({ role: 'client' }, 'email password')
            .sort({ registration_date: -1 })
            .skip(skip)
            .limit(limit)
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
            // data: formattedClients
            data: {
                clientsCount,
                totalPages,
                currentPage,
                formattedClients,
            },
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
        const { _idUser, isBlocked } = req.body;
        const user = await User.findOneAndUpdate(
            { _id: _idUser },
            { $set: { isBlocked: !isBlocked } },
            { new: true }
        );
        //user.isBlocked = !user.isBlocked;
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
    if (!birthdate) {
        return null
    }
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
## Params: page
## Result: status, message, data
===============================*/
async function getAllOrganizers(req, res) {
    try {
        const { page } = req.body;
        const organizersCount = await User.countDocuments({ role: 'organizer' });
        const limit = 5; // Number of clients per page
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, organizersCount);

        const organizersInfo = await Organizer.find({ isActive: true }).sort({ registration_date: -1 })
            .skip(skip)
            .limit(limit)
            .exec();;

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersIds = organizersInfo.map(organizer => organizer.user_id);

        const organizers = await User.find({ _id: { $in: organizersIds }, isBlocked: false }).exec();

        if (!organizers || organizers.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersWithInfo = organizers.map(organizer => {
            const organizerData = {};
            const userInfo = organizersInfo.find(info => info.user_id.equals(organizer._id));
            organizerData._id = organizer._id;
            organizerData.email = organizer.email;
            organizerData.isBlocked = organizer.isBlocked;
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
            isBlocked: organizer.isBlocked,
            avatarImage: organizer.additionalInfo?.avatarImage
        }));

        // Handle success
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                organizersCount,
                totalPages,
                currentPage,
                formattedOrganizers
            }
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

        const eventOfOrganizer = await getAllEventOfOrganizer(organizer._id);

        // Combine the user and client information
        const detailedOrganizerInfo = {
            user_id: user._id,
            email: user.email,
            organizer_name: organizer?.organizer_name,
            phone: organizer?.phone,
            founded_date: formatDate(organizer?.founded_date),
            description: organizer?.description,
            avatarImage: organizer?.avatarImage,
            address: getAddressString(organizer?.address),
            organizer_type: organizer?.organizer_type,
            isActive: organizer?.isActive,
            website: organizer?.website,
        };
        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                organizationalInformation: detailedOrganizerInfo,
                organizationalEvents: eventOfOrganizer
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getAllEventOfOrganizer
## Describe: lấy thông tin tất cả event của tổ chức
## Params: organizerId
## Result: formatEvent
===============================*/
async function getAllEventOfOrganizer(organizerId) {
    try {
        const events = await Event.find({ organizer_id: organizerId });
        if (!events) {
            return null;
        }
        const formatEvent = events.map((event) => ({
            event_name: event?.event_name,
            type_of_event: event?.type_of_event,
            event_location: getAddressString(event?.event_location),
            start_sales_date: formatDate(event?.sales_date.start_sales_date),
            end_sales_date: formatDate(event?.sales_date.end_sales_date),
            type_of_event: event?.type_of_event,
            isActive: event?.isActive,
            isHot: event?.isHot,
            totalRating: event?.totalRating,
            expectedAmount: calculateExpectedAmount(event),
            totalRevenue: calculateTotalRevenue(event),
            event_dates: getEventDateInformation(event),
        }));
        return formatEvent;
    } catch (error) {
        console.error("Error retrieving events:", error);
        throw error;
    }
}

/*=============================
## Name function: getEventDateInformation
## Describe: lấy thông tin của sự kiện
## Params: event
## Result: eventDateInformation
===============================*/
function getEventDateInformation(event) {
    const eventDateInformation = event.event_date.map((eventDate) => {
        const areasInformation = eventDate.event_areas.map((area) => ({
            name_areas: area.name_areas,
            total_row: area.total_row,
            ticket_price: area.ticket_price,
            total_seats_area: area.rows.reduce(
                (acc, row) => acc + row.total_chair,
                0
            ),
        }));

        const totalSeatsSold = eventDate.event_areas.reduce(
            (acc, area) =>
                acc +
                area.rows.reduce(
                    (rowAcc, row) =>
                        rowAcc +
                        row.chairs.reduce(
                            (chairAcc, chair) => chairAcc + (chair.isBuy ? 1 : 0),
                            0
                        ),
                    0
                ),
            0
        );

        return {
            day_number: eventDate.day_number,
            date: formatDateTime(eventDate.date),
            areas_information: areasInformation,
            total_seats_sold: totalSeatsSold,
        };
    });

    return eventDateInformation;
}

/*=============================
## Name function: formatDateTime
## Describe: format lại ngày và time
## Params: dateTime
## Result: fomatDate
===============================*/
function formatDateTime(dateTime) {
    if (!dateTime) {
        return null
    }
    const dateTimeConver = new Date(dateTime);

    const date = dateTimeConver.toLocaleDateString();
    const time = dateTimeConver.toLocaleTimeString();
    const fomatDate = `${date} ${time}`
    return fomatDate;
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

        await PayBusiness.create({
            organizers_id: organizer._id,
            organizerTotalAmount: 0,
        })

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
## Name function: getAllOrganizerBlockeds
## Describe: Lấy thông tin của Organizer bị blocked
## Params: page
## Result: status, message, data
===============================*/
async function getAllOrganizerBlockeds(req, res) {
    try {
        const { page } = req.body;
        const organizersInfo = await Organizer.find({ isActive: true }).exec();

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersIds = organizersInfo.map(organizer => organizer.user_id);

        const organizersCount = await User.countDocuments({ _id: { $in: organizersIds }, isBlocked: true });

        const limit = 5; // Number of clients per page
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, organizersCount);

        const organizers = await User.find({ _id: { $in: organizersIds }, isBlocked: true }).skip(skip)
            .limit(limit)
            .exec()

        if (!organizers || organizers.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersWithInfo = organizers.map(organizer => {
            const organizerData = {};
            const userInfo = organizersInfo.find(info => info.user_id.equals(organizer._id));
            organizerData._id = organizer._id;
            organizerData.email = organizer.email;
            organizerData.isBlocked = organizer.isBlocked;
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
            isBlocked: organizer.isBlocked,
            avatarImage: organizer.additionalInfo?.avatarImage
        }));

        // Handle success
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                organizersCount,
                totalPages,
                currentPage,
                formattedOrganizers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
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
## Params: page
## Result: status, message, data
===============================*/
async function getAllOrganizersIsActiveFalse(req, res) {
    try {
        const { page } = req.body;
        const organizersInfo = await Organizer.find({ isActive: false }).exec();

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No active organizers found' });
        }

        const organizersIds = organizersInfo.map(organizer => organizer.user_id);
        const organizersCount = await User.countDocuments({ _id: { $in: organizersIds } });

        const limit = 5; // Number of clients per page
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, organizersCount);

        const organizers = await User.find({ _id: { $in: organizersIds } }, 'email').skip(skip)
            .limit(limit)
            .exec();

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
            data: {
                organizersCount,
                totalPages,
                currentPage,
                formattedOrganizers
            }
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
        const { page } = req.body;
        const eventsCount = await Event.countDocuments({ isActive: false });
        const limit = 5; // Number of clients per page
        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, eventsCount);
        // Find all events with isActive set to false
        const events = await Event.find({ isActive: false }).populate('organizer_id', 'organizer_name').skip(skip)
            .limit(limit)
            .exec();

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
            data: {
                eventsCount,
                totalPages,
                currentPage,
                formattedEvent
            }
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
                            const onePercentSeatsSold = row.ticket_price * 0.01;
                            //quản trị viên kiếm được 1% giá vé cho mỗi ghế được bán
                            adminEarnings += onePercentSeatsSold;
                        }
                    });
                });
            });
        });
    });
    return { totalAmountSold, adminEarnings }
}

/*=============================
## Name function: getHomeAdmin
## Describe: lấy thông tin cho trang HomeAdmin
## Params: none
## Result: status, message, data
===============================*/
async function getHomeAdmin(req, res) {
    try {
        const events = await Event.find();
        const refundOrders = await RefundOrder.find({ 'OrderRefunds.refunded': true });

        const totalAmount = calculateTotalAmountAndAdminEarnings(events);
        const totalRefund = calculateTotalMoneyRefunded(refundOrders);
        // const calculateDaily = await calculateDailyStats(startDate, endDate);
        const dataChart = await getTopRatedEvents();

        const TotalMoneyAdminHas = totalAmount.adminEarnings + totalRefund.adminEarRefund;

        const fomatData = {
            totalAmountSold: formatMoney(totalAmount.totalAmountSold),
            formatMoneyRefund: formatMoney(totalRefund.totalMoneyRefunded),
            totalAdminEarnings: formatMoney(totalAmount.adminEarnings),
            adminEarRefund: formatMoney(totalRefund.adminEarRefund),
            totalMoneyAdminHas: TotalMoneyAdminHas,
            dataChart: dataChart
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
    let adminEarRefund = 0;

    refundOrders.forEach(refundOrder => {
        refundOrder.OrderRefunds.forEach(orderRefundDetail => {
            totalMoneyRefunded += orderRefundDetail.money_refund;
            ActualFare = (totalMoneyRefunded * 100) / 70;
            adminEarRefund = (ActualFare * 15) / 100;
        })
    });

    return { totalMoneyRefunded, adminEarRefund }
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
    if (!date) {
        return null
    }
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
        const { page } = req.body;
        const orders = await Order.find().lean();

        // Calculate total tickets and total amount
        let totalTickets = 0;
        let totalAmount = 0;

        orders.forEach((order) => {
            order.Orders.forEach((orderDetail) => {
                totalAmount += orderDetail.totalAmount;
            });
            totalTickets += order.Orders.length;
        });

        const { totalPages, currentPage, eventsWithOrdersCount, eventsWithTotalTransactions } = await getAllEventsWithOrders(page);

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalTransactionAmount: formatMoney(totalAmount),
                count: totalTickets,
                eventsWithOrdersCount: eventsWithOrdersCount,
                totalPages: totalPages,
                currentPage: currentPage,
                orders: eventsWithTotalTransactions
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getAllEventsWithOrders
## Describe: lấy event_id, event_name, event_date, event_location,totalTransactions của Order
## Params: page
## Result: eventsWithTotalTransactions
===============================*/
async function getAllEventsWithOrders(page) {
    try {
        const limit = 5; // Number of orders per page

        const eventsWithOrdersCount = await Order.countDocuments({ 'Orders.0': { $exists: true } });

        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, eventsWithOrdersCount);

        const eventsWithOrders = await Order.find({ 'Orders.0': { $exists: true } })
            .select('event_id event_name event_date event_location Orders')
            .skip(skip)
            .limit(limit)
            .lean();

        const eventsWithTotalTransactions = eventsWithOrders.map(event => ({
            _id: event._id,
            event_name: event.event_name,
            event_date: formatDate(event.event_date),
            event_location: event.event_location,
            totalTransactions: event.Orders.length
        }));

        return { totalPages, currentPage, eventsWithOrdersCount, eventsWithTotalTransactions };
    } catch (err) {
        console.error(err);
    }
};

/*=============================
## Name function: getInformationEvent
## Describe: Lấy thông tin của event
## Params: _idOrder
## Result: status, message, data
===============================*/
async function getInformationEvent(req, res) {
    try {
        const { _idOrder } = req.body;
        const order = await Order.findById(_idOrder).lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const eventId = order.event_id;
        const event = await Event.findById(eventId).populate('organizer_id', 'organizer_name').lean();

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const totalSeats = getTotalSeats(event, order)

        const eventInformationFormat = {
            _id: order._id,
            event_name: event?.event_name,
            eventImage: event?.eventImage,
            type_of_event: event?.type_of_event,
            event_location: getAddressString(event?.event_location),
            event_description: event?.event_description,
            start_sales_date: formatDate(event?.sales_date?.start_sales_date),
            end_sales_date: formatDate(event?.sales_date?.end_sales_date),
            totalRating: event?.totalRating,
            totalSeatsSoldAtEvent: totalSeats?.totalSeatsSoldAtEvent,
            totalTicketSalesAtEvent: totalSeats?.totalTicketSalesAtEvent,
            totalSeatsSoldAtOrder: totalSeats?.totalSeatsSoldAtOrder
        };

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: eventInformationFormat,
            // transactionInformation: transactionInformation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/*=============================
## Name function: getTotalSeats
## Describe: Tính toonmgr số ghế đã bán
## Params: event, order
## Result: totalSeatsSoldAtEvent, totalSeatsSoldAtOrder, totalTicketSalesAtEvent
===============================*/
function getTotalSeats(event, order) {
    // Tính tổng số ghế đã bán tại bảng Event
    let totalSeatsSoldAtEvent = 0;
    let totalTicketSalesAtEvent = 0;
    event.event_date.forEach((day) => {
        day.event_areas.forEach((area) => {
            area.rows.forEach((row) => {
                row?.chairs?.forEach((chair) => {
                    if (chair.isBuy) {
                        totalSeatsSoldAtEvent++;
                        totalTicketSalesAtEvent += row.ticket_price;
                    }
                });
            });
        });
    });

    // Tính tổng số ghế đã bán tại bảng Order
    let totalSeatsSoldAtOrder = 0;
    order.Orders.forEach((orderDetail) => {
        totalSeatsSoldAtOrder += orderDetail.tickets.length;
    });

    return {
        totalSeatsSoldAtEvent,
        totalSeatsSoldAtOrder,
        totalTicketSalesAtEvent
    }
}

/*=============================
## Name function: getTransactionInformation
## Describe: Lấy thông tin giao dịch
## Params: _idOrder, page
## Result: status, message, data
===============================*/
async function getTransactionInformation(req, res) {
    try {
        const { _idOrder, page } = req.body;
        const order = await Order.findById(_idOrder).lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Get total number of transactions
        const totalTransactions = order.Orders.length;

        // Calculate pagination parameters
        const limit = 5;

        const { totalPages, skip, currentPage } = calculatePaginationParams(page, limit, totalTransactions);

        // Get orders for the current page
        const orders = order.Orders.slice(skip, skip + limit);

        // Get transaction information for each order
        const transactionInformation = [];
        for (const orderDetail of orders) {
            const clientInfo = await getMailOfClient(orderDetail.client_id);
            const result = {
                transaction_date: formatDateTime(orderDetail.transaction_date),
                zp_trans_id: orderDetail.zp_trans_id,
                totalAmount: orderDetail.totalAmount,
                numberOfTickets: orderDetail.tickets.length,
                client_email: clientInfo.fomatInfoClient.email,
                client_name: clientInfo.fomatInfoClient.full_name,
            };
            transactionInformation.push(result);
        }

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: {
                totalTransactions,
                totalPages,
                currentPage,
                transactionInformation,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/*=============================
## Name function: calculatePaginationParams
## Describe: Phân trang
## Params: page, limit, totalCount
## Result: totalPages, skip, currentPage
===============================*/
function calculatePaginationParams(page, limit, totalCount) {
    // Tính tổng số trang nếu TotalCount lớn hơn 0, nếu không thì đặt TotalPages thành 0
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;
    const currentPage = page || 1;
    const skip = (page - 1) * limit; // Tính số lượng tài liệu cần bỏ qua

    return {
        totalPages: totalPages,
        skip: skip,
        currentPage: currentPage
    };
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

/*=============================
## Name function: getTopRatedEvents
## Describe: Lấy 5 sự kiện được xếp hạng hàng đầu
## Params: none
## Result: eventsWithTransactions
===============================*/
async function getTopRatedEvents() {
    try {
        // Retrieve the top 5 events based on totalRating
        const topEvents = await Event.find()
            .sort({ totalRating: -1 })
            .limit(5)
            .exec();

        // Calculate the total number of transactions for each event
        const eventIds = topEvents.map(event => event._id);
        const transactionCounts = await Order.aggregate([
            { $match: { event_id: { $in: eventIds } } },
            { $addFields: { totalTransactions: { $size: '$Orders' } } },
            { $project: { event_id: 1, totalTransactions: 1 } },
        ]);

        // Merge the totalTransactions into the corresponding events
        const eventsWithTransactions = topEvents.map(event => {
            const transactionCount = transactionCounts.find(count => count.event_id.equals(event._id));
            return {
                event_name: event.event_name,
                totalTransactions: transactionCount ? transactionCount.totalTransactions : 0
            };
        });

        return eventsWithTransactions
    } catch (error) {
        console.error(err);
    }
}

module.exports = {
    getAllClients,
    getDetailClient,
    getAllOrganizers,
    getDetailOrganizer,
    getAllOrganizerBlockeds,
    setIsActiveOrganizer,
    setIsActiveEvent,
    setIsHotEvent,
    getAllOrganizersIsActiveFalse,
    getAllEventIsActiveFalse,
    getDetailEventActiveIsFalse,
    getHomeAdmin,
    getAllOrders,
    getMailOfClient,
    formatMoney,
    blockedUser,
    formatDate,
    formatDateTime,
    getAllEventsWithOrders,
    getInformationEvent,
    getTransactionInformation,
    getTopRatedEvents,
    calculatePaginationParams
}