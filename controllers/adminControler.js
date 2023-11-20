const Client = require("../model/clientsModel");
const Event = require("../model/eventModels");
const Organizer = require("../model/organizersModels");
const User = require("../model/usersModel");

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
## Name function: setIsActiveEvent
## Describe: Phê duyệt khi Organizer tạo Event
## Params: _idEvent
## Result: status, message, data
===============================*/
async function setIsActiveEvent(req, res) {
    try {
        const { _idEvent } = req.body;
        const event = await Event.findByIdAndUpdate(_idEvent, { isActive: true }, { new: true })
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
            create_date: event.create_date,
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
    getDetailEventActiveIsFalse
}