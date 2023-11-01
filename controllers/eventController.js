const Organizer = require('../model/organizersModels');
const Event = require('../model/eventModels');
const upLoadImg = require("../controllers/eventController");
const unorm = require('unorm');

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
## Name function: generateEventDate
## Describe: generate row and chair
## Params: event_date
## Result: data
===============================*/
function generateEventDate(event_date) {
    return event_date?.map(date => ({
        day_number: date.day_number,
        date: date.date,
        event_areas: date.event_areas?.map(area => ({
            name_areas: area.name_areas,
            total_row: area.total_row,
            rows: area.rows?.map(row => ({
                row_name: row.row_name,
                total_chair: row.total_chair,
                ticket_price: area.ticket_price,
                chairs: Array.from({ length: row.total_chair }, (_, chairIndex) => ({
                    chair_name: `${row.row_name}${chairIndex + 1}`,
                    isBuy: false,
                    isCheckin: false,
                    client_id: null,
                })),
            })),
        })),
    }));
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
            eventImage,
            type_layout,
            maxTicketInOrder,
            event_date,
            event_location,
            event_description,
            sales_date,
            isActive,
            isHot
        } = req.body.eventInfo;

        const isExists = await checkExistsIdOrganizer(_idOrganizer);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }
        const _idOfOrganizer = (await isExists).organizer._id;

        //up ảnh bìa sự kiện
        let urlImageEvent;
        if (!eventImage) {
            urlImageEvent = process.env.IMG_EVENT;
        }
        else {
            const dataImgAfterUpload = upLoadImg(eventImage, "ImgEvent");
            urlImageEvent = (await dataImgAfterUpload).urlImage;
        }
        //up ảnh khán đài
        let urlImageStand;
        if (!type_layout) {
            urlImageStand = process.env.IMG_STANDS;
        }
        else {
            const dataImgAfterUpload = upLoadImg(type_layout, "ImgStand");
            urlImageStand = (await dataImgAfterUpload).urlImage;
        }
        //tao event
        const event = await Event.create({
            organizer_id: _idOfOrganizer,
            event_name: event_name,
            type_of_event: type_of_event,
            eventImage: urlImageEvent,
            type_layout: urlImageStand,
            maxTicketInOrder: maxTicketInOrder,
            event_date: generateEventDate(event_date),
            event_location: event_location,
            event_description: event_description,
            sales_date: sales_date,
            isActive: isActive,
            isHot: isHot
        });

        res.status(200).json({
            status: true,
            data: event,
            message: `Event tạo thành công`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
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
        const limit = 9; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ isActive: true }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        const events = await Event.find({ isActive: true })
            .sort({ isHot: -1, 'event_date.date': 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            events,
            message: `Có ${totalEvents} sự kiện đã tìm thấy`,
            currentPage: page,
            totalPages,
        }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: Get Event by Id
## Describe: lấy tất cả event by Id
## Params: "_idOrganizer"
## Result: data
===============================*/
async function getEventsByIdOrganizer(req, res) {
    try {
        const { _idOrganizer } = req.body;

        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 9; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ organizer_id: _idOrganizer }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        const isExists = await checkExistsIdOrganizer(_idOrganizer);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfOrganizer = (await isExists).organizer._id;

        const events = await Event.find({ organizer_id: _idOfOrganizer })
            .skip(skip)
            .limit(limit);

        res.json({
            events,
            message: `Có ${totalEvents} sự kiện đã tìm thấy`,
            currentPage: page,
            totalPages,
        }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: getDetailEvent
## Describe: xem chi tiết sự kiện
## Params: "_idEvent"
## Result: data
===============================*/
async function getDetailEvent(req, res) {
    try {
        const { _idEvent } = req.body;
        const event = await Event.findById(_idEvent);
        if (!event) {
            return res.status(400).json({ status: false, message: "Không tìm thấy sự kiện." });
        }
        res.json({ status: true, event: event });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

async function getEventByType(req, res) {
    try {
        const { type_of_event } = req.body;
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 9; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ type_of_event: type_of_event }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        const events = await Event.find({ type_of_event: type_of_event })
            .skip(skip)
            .limit(limit);

        res.json({
            events,
            message: `Có ${totalEvents} sự kiện đã tìm thấy`,
            currentPage: page,
            totalPages,
        }); // Trả về danh sách sự kiện, trang hiện tại và tổng số trang dưới dạng JSON
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
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
            eventImage,
            type_layout,
            maxTicketInOrder,
            event_date,
            event_location,
            event_description,
            sales_date,
            isActive,
            isHot
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

        //up ảnh bìa sự kiện
        let urlImageEvent;
        if (!eventImage) {
            urlImageEvent = event.IMG_EVENT;
        }
        else {
            const dataImgAfterUpload = upLoadImg(eventImage, "ImgEvent");
            urlImageEvent = (await dataImgAfterUpload).urlImage;
        }
        //up ảnh khán đài
        let urlImageStand;
        if (!type_layout) {
            urlImageStand = event.type_layout;
        }
        else {
            const dataImgAfterUpload = upLoadImg(type_layout, "ImgStand");
            urlImageStand = (await dataImgAfterUpload).urlImage;
        }
        // Cập nhật thông tin sự kiện
        event.event_name = event_name;
        event.type_of_event = type_of_event;
        event.eventImage = urlImageEvent;
        event.type_layout = urlImageStand;
        event.maxTicketInOrder = maxTicketInOrder;
        event.event_date = generateEventDate(event_date);
        event.event_location = event_location;
        event.event_description = event_description;
        event.sales_date = sales_date;
        event.isActive = isActive;
        event.isHot = isHot;
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
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: searchEvent
## Describe: tìm kiếm event
## Params: các trường tìm kiếm: event_name, type_of_event, event_location, event_date (có thể để null vài trường hoặc tất cả)
## Result: status, message, data
===============================*/
async function searchEvent(req, res) {
    try {
        const { event_name, type_of_event, event_location, event_date } = req.body;
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 9; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua

        // Xây dựng các điều kiện tìm kiếm
        const searchConditions = { isActive: true };

        if (event_name) {
            const keywords = event_name.split(" "); // Tách từ khóa từ tên sự kiện
            const regexKeywords = keywords?.map((keyword) => {
                return new RegExp(keyword, "i"); // Tạo biểu thức chính quy cho mỗi từ khóa
            });
            searchConditions.event_name = { $all: regexKeywords }; // Tìm kiếm các từ khóa trong tên sự kiện
        }

        if (type_of_event) {
            searchConditions.type_of_event = type_of_event;
        }

        /* if (event_location) {
            const keywords = event_location.split(" ");
            const regexKeywords = keywords?.map((keyword) => {
                const keywordNormalized = unorm.nfkd(keyword).replace(/[\u0300-\u036f]/g, ""); // Chuẩn hóa và loại bỏ dấu tiếng Việt từ từ khóa
                return new RegExp(keywordNormalized, "i");
            });
            searchConditions[event_location.city] = { $in: regexKeywords };
        } */
        if (event_location && event_location.city) {
            const cityKeyword = event_location.city;
            const cityRegex = new RegExp(cityKeyword, "i");
            searchConditions['event_location.city'] = cityRegex;
        }

        if (event_date) {
            // Tìm kiếm sự kiện dựa trên ngày 
            searchConditions.event_date = {
                $elemMatch: {
                    date: new Date(event_date),
                },
            };
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

async function totalMoney(req, res) {
    try {
        const { _idEvent } = req.body;

        // Kiểm tra sự tồn tại của sự kiện và xác thực người tổ chức
        const events = await Event.findById(_idEvent);
        if (!events) {
            return res.status(400).json({
                status: false,
                message: 'Sự kiện không tồn tại',
            });
        }

        const event = await Event.findById(_idEvent).populate('event_date.event_areas.rows');

        let totalSeatsByArea = {};
        let totalAmount = 0;

        // Lặp qua các khu vực
        for (const area of event.event_date[0].event_areas) {
            const areaName = area.name_areas;
            let seatsInArea = 0;

            // Lặp qua các hàng trong khu vực
            for (const row of area.rows) {
                seatsInArea += row.total_chair;
            }

            totalSeatsByArea[areaName] = seatsInArea;
        }

        // Tính tổng tiền
        for (const area of event.event_date[0].event_areas) {
            for (const row of area.rows) {
                totalAmount += row.total_chair * row.ticket_price;
            }
        }

        res.json({
            totalSeatsByArea,
            message: `Tổng tiền dự kiến ${totalAmount}`,
        }); // Trả về tổng số ghế theo khu vực và tổng tiền dưới dạng JSON
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventsByIdOrganizer,
    getDetailEvent,
    getEventByType,
    updateEvent,
    searchEvent,
    totalMoney
};