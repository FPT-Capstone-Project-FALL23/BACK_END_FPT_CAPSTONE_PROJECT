const Event = require("../model/eventModels");

async function getEventToday(req, res) {
    try {
        const { _idOrganizer } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const eventsToday = await Event.find({
            'event_date.date': {
                $gte: today,
                $lt: tomorrow,
            },
            organizer_id: _idOrganizer,
            isActive: true,
        });
        res.status(200).json({
            status: true,
            eventsToday
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function check_in(req, res) {
    try {
        const { _idEventDB } = req.body;
        const { userId, eventId, chairId } = req.body.QR;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Kiểm tra _idEventDB và eventId có khớp nhau không
        if (_idEventDB !== eventId) {
            return res.status(400).json({ message: 'Check-in failed. Incorrect QR' });
        }
        // Thực hiện check-in
        // Tìm sự kiện trong cơ sở dữ liệu
        const event = await Event.findOne({
            _id: _idEventDB,
            'event_date.date': {
                $gte: today,
                $lt: tomorrow,
            },
            isActive: true,
        });

        if (!event) {
            return res.status(400).json({ status: false, message: 'Check-in failed. Event not found or not active for the specified date.' });
        }

        // Tìm ngày cụ thể trong sự kiện
        const eventDay = event.event_date.find(day => day.date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0));

        if (!eventDay) {
            return res.status(400).json({ status: false, message: 'Check-in failed. Event date not found.' });
        }

        // Tìm ghế cụ thể trong sự kiện
        const chair = eventDay.event_areas[0].rows[0].chairs.find(chair => chair._id.toString() === chairId);

        if (!chair) {
            return res.status(400).json({ status: false, message: 'Check-in failed. Chair not found.' });
        }
        // Kiểm tra xem userId có phải là chủ sở hữu của ghế không
        if (chair.client_id === null || chair.client_id.toString() !== userId) {
            return res.status(400).json({ status: false, message: 'Check-in failed. User does not own the chair.' });
        }
        // Thực hiện check-in
        /* chair.isCheckin = true;
        await event.save(); */

        return res.status(200).json({ status: true, message: 'Check-in successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}
module.exports = {
    getEventToday, check_in
}