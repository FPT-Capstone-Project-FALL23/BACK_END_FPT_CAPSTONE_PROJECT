const Organizer = require('../model/organizersModels');
const Event = require('../model/eventModels');


/*=============================
## Name function: checkExistsIdOrganizer
## Describe: Xử lý xem _id có tồn tại ở Organizer không
## Params: _id
## Result: status, message, user
===============================*/
async function checkExistsIdOrganizer(_id) {
    const organizer = await Organizer.findById(_id); //Kiểm tra _id có tồn tại trong user
    if (!organizer) {
        return {
            message: "Người dùng chưa có",
            status: false
        };
    }
    return {
        status: true,
        message: 'Tìm thấy người dùng',
        organizer: organizer
    };
}

/*=============================
## Name function: createEvent
## Describe: tạo event
## Params: _idOrganizer, eventInfo
## Result: status, message,data
===============================*/
async function createEvent(req, res) {
    try {
        const { _idOrganizer } = req.body;
        const {
            event_name, 
            type_of_event, 
            event_date,
            event_location, 
            event_description, 
            sales_date, 
            event_areas 
        } = req.body.eventInfo;

        const isExists = await checkExistsIdOrganizer(_idOrganizer);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfOrganizer = (await isExists).organizer._id;
        //tao event
        const event = await Event.create({
            organizer_id: _idOfOrganizer,
            event_name: event_name,
            type_of_event: type_of_event,
            event_date: event_date,
            event_location: event_location,
            event_description: event_description,
            sales_date: sales_date,
            event_areas: event_areas,
        });

        res.status(200).json({
            status: true,
            data: event,
            message: `Event tạo thành công`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message});
    }
}

module.exports = {
    createEvent
};