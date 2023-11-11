const Client = require("../model/clientsModel");
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
            birthday: client.additionalInfo?.birthday.toISOString().split('T')[0],
            gender: client.additionalInfo?.gender,
            age: calculateAge(client.additionalInfo?.birthday)
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
## Describe: lấy thông tin của _id client
## Params: none
## Result: status, message, data
===============================*/
async function getAllOrganizers(req, res) {
    try {
        const organizers = await User.find({ role: 'organizer' }, 'email password').exec();

        if (!organizers || organizers.length === 0) {
            return res.status(404).json({ message: 'No organizers found' });
        }

        const organizersIds = organizers.map(organizer => organizer._id);

        const organizersInfo = await Organizer.find({ user_id: { $in: organizersIds } }).exec();

        if (!organizersInfo || organizersInfo.length === 0) {
            return res.status(404).json({ message: 'No organizer information found' });
        }

        const organizersWithInfo = organizers.map(organizer => {
            const organizerData = organizer.toObject();
            const userInfo = organizersInfo.find(info => info.user_id.equals(organizer._id));
            organizerData.additionalInfo = userInfo;
            return organizerData;
        });

        // Format the response
        const formattedOrganizers = organizersWithInfo.map(organizer => ({
            _id: organizer._id,
            email: organizer.email,
            phone: organizer.additionalInfo?.phone,
            website: organizer.additionalInfo?.website,
            organizer_name: organizer.additionalInfo?.organizer_name,
            founded_date: organizer.additionalInfo?.founded_date.toISOString().split('T')[0],
            isActive: organizer.additionalInfo?.isActive,
        }));

        // Xử lý khi thành công
        res.status(200).json({
            status: true,
            message: 'success',
            data: formattedOrganizers
        });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: getDetailClient
## Describe: lấy thông tin của _id client
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

module.exports = { getAllClients, getDetailClient, getAllOrganizers, getDetailOrganizer }