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
    return event_date.map(date => ({
        day_number: date.day_number,
        date: new Date(date.date),
        event_areas: date.event_areas.map(area => ({
            name_areas: area.name_areas,
            total_row: area.total_row,
            rows: area.rows.map(row => ({
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
        const totalEvents = await Event.countDocuments({ isActive: true, organizer_id: _idOrganizer }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        const isExists = await checkExistsIdOrganizer(_idOrganizer);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfOrganizer = (await isExists).organizer._id;

        const events = await Event.find({ isActive: true, organizer_id: _idOfOrganizer })
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
        const organizer = await Organizer.findById(event.organizer_id);
        res.json({ status: true, event: event, organizer: organizer.organizer_name });
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
            const regexKeywords = keywords.map((keyword) => {
                return new RegExp(keyword, "i"); // Tạo biểu thức chính quy cho mỗi từ khóa
            });
            searchConditions.event_name = { $all: regexKeywords }; // Tìm kiếm các từ khóa trong tên sự kiện
        }

        if (type_of_event) {
            searchConditions.type_of_event = type_of_event;
        }

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
            .sort({ isHot: -1, 'event_date.date': 1 })
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


//
function getEventStatus(event) {
    const currentDate = new Date();
    const firstSaleDate = event.sales_date.start_sales_date;
    const lastEventDate = event.event_date[0].date;
    const isActive = event.isActive;

    if (currentDate < firstSaleDate || !isActive ) {
        return 'UPCOMING';
    } else if (currentDate >= firstSaleDate && currentDate <= lastEventDate) {
        return 'HAPPENNING';
    } else {
        return 'FINISHED';
    }
}
// Hàm để tính tổng tiền thực tế từ một sự kiện
function calculateTotalRevenue(event) {
    let totalRevenue = 0;

    // Lặp qua tất cả khu vực (areas)
    event.event_date[0].event_areas.forEach((area) => {
        // Lặp qua tất cả dãy ghế (rows) trong khu vực
        area.rows.forEach((row) => {
            // Lặp qua tất cả các ghế (chairs) trong dãy ghế
            row.chairs.forEach((chair) => {
                if (chair.isBuy) {
                    totalRevenue += row.ticket_price;
                }
            });
        });
    });

    return totalRevenue;
}

async function listEventOrganizer(req, res) {
    try {
        const { _idOrganizer } = req.body;
        const page = parseInt(req.body.page) || 1; // Trang hiện tại (mặc định là trang 1)
        const limit = 10; // Số lượng sự kiện hiển thị trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sự kiện bỏ qua
        const totalEvents = await Event.countDocuments({ organizer_id: _idOrganizer }); // Tổng số sự kiện trong bảng
        const totalPages = Math.ceil(totalEvents / limit); // Tổng số trang

        const events = await Event.find({ organizer_id: _idOrganizer })
            .sort({ isHot: -1, 'event_date.date': 1 })
            .skip(skip)
            .limit(limit);

        // Tạo một mảng kết quả để lưu thông tin sự kiện với trạng thái
        const eventList = [];

        // Lặp qua danh sách sự kiện và trích xuất thông tin bạn muốn
        events.forEach((event) => {
            const eventStatus = getEventStatus(event);
            const totalRevenue = calculateTotalRevenue(event);
            // Tính toán số tiền dự kiến
            let totalMoney = 0;
            event.event_date[0].event_areas.forEach((area) => {
                area.rows.forEach((row) => {
                    totalMoney += row.total_chair * row.ticket_price;
                });
            });
            // Thêm thông tin sự kiện và trạng thái vào danh sách kết quả
            eventList.push({
                eventName: event.event_name,
                startDay: event.event_date[0].date,
                totalEstimated: totalMoney,
                totalActual: totalRevenue,
                eventStatus: eventStatus,
                isActive: event.isActive,
            });
        });

        res.status(200).json({
            status: true,
            data: eventList,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: updateChairStatus
## Describe: cập nhật status
## Params: _idevent, id_chair
## Result: status, message,data
===============================*/
async function updateChairStatus(req, res) {
    try {
      const { _idEvent, chairId  } = req.body;
      
      const event = await Event.findById(_idEvent);
      if (!event) {
        return res.status(404).json({message: 'Không tìm thấy sự kiện'});
      }
      
      // Tìm ghế cần cập nhật
      const chair = findChairById(event, chairId );
      
      if (!chair) {
        return res.status(404).json({message: 'Không tìm thấy ghế'});
      }
      
      // Cập nhật trạng thái isBuy
      chair.isBuy = !chair.isBuy; 
      
      // Lưu lại sự kiện
      const updatedEvent = await event.save();
      
      res.json(updatedEvent);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({message: error.message});
    }
  }
  
  // Tìm ghế dựa trên id ghế
  function findChairById(event, chairId ) {
    let foundChair = null;
    event.event_date.some(date => {
        return date.event_areas.some(area => {
            return area.rows.some(row => {
                const chair = row.chairs.find(chair => chair.id === chairId);
                if (chair) {
                    foundChair = chair;
                    return true; // Dừng tìm kiếm khi tìm thấy ghế
                }
            });
        });
    });

    return foundChair;
  }

module.exports = {
    createEvent,
    getAllEvents,
    getEventsByIdOrganizer,
    getDetailEvent,
    getEventByType,
    updateEvent,
    searchEvent,
    listEventOrganizer,
    updateChairStatus
};