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
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments(); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        
        const events = await Event.find()
        .skip(skip)
        .limit(limit);

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

        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
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
        .limit(limit);

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
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ type_of_event: type_of_event}); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang
        
        const events = await Event.find({ type_of_event: type_of_event})
        .skip(skip)
        .limit(limit); 

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
## Name function: updateEvent
## Describe: chỉnh sửa event
## Params: _idEvent, eventInfo
## Result: status, message,data
===============================*/
async function updateEvent(req, res) {
    try {
        const { _idEvent } = req.body;
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

         // Kiểm tra sự tồn tại của sự kiện và xác thực người tổ chức
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({
                status: false,
                message: 'Sự kiện không tồn tại',
            });
        }
        if (event.organizer_id.toString() !== _idOrganizer) {
            return res.status(400).json({
                status: false,
                message: 'Bạn không có quyền chỉnh sửa sự kiện này',
            });
        }
        
        // Cập nhật thông tin sự kiện
        event.event_name = event_name;
        event.type_of_event = type_of_event;
        event.event_date = event_date;
        event.event_location = event_location;
        event.event_description = event_description;
        event.sales_date = sales_date;
        event.event_areas = event_areas;

        // Lưu sự kiện đã cập nhật
        const updatedEvent = await event.save();

        res.status(200).json({
            status: true,
            data: updatedEvent,
            message: 'Cập nhật sự kiện thành công',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message});
    }
}

/*=============================
## Name function: searchEvent
## Describe: tìm kiếm event
## Params: các trường tìm kiếm: event_name, type_of_event, event_location, event_date, event_price (có thể để null vài trường hoặc tất cả)
## Result: status, message, data
===============================*/
async function searchEvent(req, res) {
    try {
        const { event_name, type_of_event, event_location, event_date, event_price } = req.body;
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        

        // Xây dựng các điều kiện tìm kiếm
        const searchConditions = {};

        if (event_name) {
            searchConditions.event_name = event_name;
        }

        if (type_of_event) {
            searchConditions.type_of_event = type_of_event;
        }

        if (event_location) {
            searchConditions.event_location = event_location;
        }

        if (event_date) {
            // Tìm kiếm sự kiện dựa trên ngày
            searchConditions.event_date = {
                $elemMatch: {
                    date: new Date(event_date)
                }
            };
        }

        if (event_price) {
            searchConditions.event_price = event_price;
        }

        // Tìm kiếm sự kiện dựa trên các điều kiện
        const events = await Event.find(searchConditions)
        .skip(skip)
        .limit(limit);
        
        const totalEvents = await Event.countDocuments(searchConditions); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        res.status(200).json({
            status: true,
            data: events,
            currentPage: page,
            totalPages,
            message: `Có ${totalEvents} sự kiện đã tìm thấy`,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventsById,
    getEventByType,
    updateEvent,
    searchEvent
};