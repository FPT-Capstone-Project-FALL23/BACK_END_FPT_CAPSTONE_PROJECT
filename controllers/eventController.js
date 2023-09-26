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

/*=============================
## Name function: GetAllEvent
## Describe: lấy tất cả event
## Params: 
## Result: data
===============================*/
async function getAllEvents(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments(); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        
        const events = await Event.find()
        .skip(skip)
        .limit(limit)
        .exec(); // Query sự kiện theo phân trang

        res.json({
            events,
            currentPage: page,
            totalPages,
          }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message});
    }
}

/*=============================
## Name function: Get Event by Id
## Describe: lấy tất cả event by Id
## Params: "_idOrganizer"
## Result: data
===============================*/
async function getEventsById(req, res) {
    try {
        const { _idOrganizer } = req.body;

        const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({organizer_id: _idOrganizer}); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        
        const isExists = await checkExistsIdOrganizer(_idOrganizer);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfOrganizer = (await isExists).organizer._id;

        const events = await Event.find({organizer_id: _idOfOrganizer})
        .skip(skip)
        .limit(limit)
        .exec(); // Query sự kiện theo phân trang

        res.json({
            events,
            currentPage: page,
            totalPages,
          }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message});
    }
}

async function getEventByType(req, res) {
    try {
        const { type_of_event } = req.body;
        const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ type_of_event: type_of_event}); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        
        const events = await Event.find({ type_of_event: type_of_event})
        .skip(skip)
        .limit(limit)
        .exec(); // Query sự kiện theo phân trang

        res.json({
            events,
            currentPage: page,
            totalPages,
          }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message});
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventsById,
    getEventByType
};