const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/usersModel');
const Client = require('../model/clientsModel');
const Organizer = require('../model/organizersModels');
const cloudinary = require('../config/cloudinary');


/*=============================
## Name function: generateToken
## Describe: Generate JWT token
## Params: user
## Result: token
===============================*/
function generateToken(user) {
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        'your-secret-key', // Replace with your own secret key
        { expiresIn: '1h' } // Token expiration time (1 hour)
    );
    return token;
}

/*=============================
## Name function: loginUser
## Describe: Xử lý đăng nhập của người dùng
## Params: email, password
## Result: status,token,data
===============================*/
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const verificationResult = await verifyUserCredentials(email, password);
        if (!verificationResult.status) {
            return res.status(400).json({
                status: verificationResult.status,
                message: verificationResult.message,
            });
        }
        //tạo token
        const token = generateToken(verificationResult.user);
        const roleUser = verificationResult.user.role;

        const getDataInfo = await getDataInfoOfRole(verificationResult.user._id, roleUser);

        const dataInfo = roleUser == "admin" ? null : getDataInfo.data //trả về data

        // Xử lý đăng nhập thành công
        res.status(200).json({
            status: true,
            token: token,
            message: 'Đăng nhập thành công',
            data: {
                dataUser: verificationResult.user,
                dataInfo: dataInfo,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

/*=============================
## Name function: verifyUserCredentials
## Describe: Xác minh thông tin đăng nhập của người dùng
## Params: email, password
## Result: status,message,user
===============================*/
async function verifyUserCredentials(email, password) {
    const user = await User.findOne({ email: email }); //Kiểm tra mail có đúng không
    if (!user) {
        return {
            status: false,
            message: 'Email or Password is incorrect'
        };
    }
    if (user.isBlocked == true) {
        return {
            status: false,
            message: 'Your account has been locked'
        };
    }
    const passwordMatch = await bcrypt.compare(password, user.password); //Kiển tra password có đúng không
    if (!passwordMatch) {
        return {
            status: false,
            message: 'Email or Password is incorrect'
        };
    }
    const roleUser = user.role;
    if (roleUser === 'organizer') {
        const _idUser = user._id;
        const organizer = await Organizer.findOne({ user_id: _idUser, isActive: true });
        if (!organizer) {
            return {
                status: false,
                message: 'The Organizer is not active'
            };
        }
    }

    return {
        status: true,
        message: 'Tìm thấy người dùng',
        user: user
    };
}

/*=============================
## Name function: getDataInfoOfRole
## Describe: Lấy thông tin của user phụ thuộc vào role
## Params: userId, role
## Result: data
===============================*/
async function getDataInfoOfRole(userId, role) {
    let data = null; // Khởi tạo dữ liệu dưới dạng null (giá trị trả về mặc định)
    if (role == "client") {
        const client = await Client.findOne({ user_id: userId })
        if (client) {
            data = client; // Set data to the client nếu tìm thấy
        }
    }
    else if (role == "organizer") {
        const organizer = await Organizer.findOne({ user_id: userId })
        if (organizer) {
            data = organizer; // Set data to the organizer nếu tìm thấy
        }
    }
    return { data };
}

/*=============================
## Name function: logoutUser
## Describe: Handle user logout (not recommended in JWT)
## Params: 
## Result: message
===============================*/
function logoutUser(req, res) {
    // You can perform any necessary cleanup or actions here
    res.json({ message: 'Logged out' });
}

/*=============================
## Name function: logoutUser
## Describe: Xử lý đăng ký người dùng
## Params: email, password, role
## Result: status, data, token, message
===============================*/
async function registerUser(req, res) {
    try {
        const { email, password, role } = req.body;

        // kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: 'Email đã tồn tại'
            });
        }

        // Hash mật khẩu trước khi lưu nó
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo User
        const user = await User.create({
            email: email,
            password: hashedPassword,
            role: role,
        });
        const client = await Client.create({
            user_id: user._id,
            full_name: null,
            phone: null,
            birthday: null,
            gender: null,
            avatarImage: process.env.IMG_AVATAR,
            favorit_enres: null,
        });
        //Nhà tổ chức thì không cần token, đợi admin accept
        if (role == "organizer") {
            return res.status(200).json({
                status: true,
                data: user,
                message: `Người dùng với ${role} đã kí thành công`,
            });
        }
        //tạo token
        const token = generateToken(user);
        res.status(200).json({
            status: true,
            data: user,
            client,
            token: token,
            message: `Người dùng với ${role} đã kí thành công`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
/*=============================
## Name function: resetPassword
## Describe: Đặt lại mật khẩu cho người dùng
## Params: email, newPassword
## Result: status, message
===============================*/
async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;

        // Kiểm tra xem email có tồn tại trong hệ thống hay không
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                status: false,
                message: 'Email không tồn tại'
            });
        }

        // Hash mật khẩu trước khi lưu nó
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Thực hiện thay đổi mật khẩu cho người dùng
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.json({ status: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        res.json({ status: false, message: 'Lỗi', error: err });
    }
}

/*=============================
## Name function: changePassword
## Describe: Thay đổi  mật khẩu cho người dùng
## Params: email, newPassword
## Result: status, message
===============================*/
async function changePassword(req, res) {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Kiểm tra xem email có tồn tại trong hệ thống hay không
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                status: false,
                message: 'Email không tồn tại'
            });
        }
        // So sánh mật khẩu cũ
        const isPasswordMatch = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                status: false,
                message: 'Mật khẩu cũ không khớp'
            });
        }
        // Hash mật khẩu trước khi lưu nó
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới cho người dùng
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.json({ status: true, message: 'Thay đổi mật khẩu thành công' });
    } catch (err) {
        res.json({ status: false, message: 'Lỗi', error: err });
    }
}

/*=============================
## Name function: checkExistsIdUser
## Describe: Xử lý xem _id có tồn tại ở User không
## Params: _id
## Result: status, message, user
===============================*/
async function checkExistsIdUser(_id) {
    const user = await User.findById(_id); //Kiểm tra _id có tồn tại trong user
    if (!user) {
        return {
            message: "Người dùng chưa có",
            status: false
        };
    }
    return {
        status: true,
        message: 'Tìm thấy người dùng',
        user: user
    };
}

/*=============================
## Name function: checkExistsInCliensOrOrganizers
## Describe: Xử lý xem userId có tồn tại ở Client không
## Params: userId, isClient
## Result: status, message
===============================*/
async function checkExistsInCliensOrOrganizers(userId, isClient) {
    if (isClient) {
        const client = await Client.findOne({ user_id: userId });//Kiểm tra _id đã tồn tại trong client
        const result = await defaulResultCheckExist(client, "Client")
        return { result }
    } else {
        const organizers = await Organizer.findOne({ user_id: userId });//Kiểm tra _id đã tồn tại trong Organizer
        const result = await defaulResultCheckExist(organizers, "Organizers")
        return { result }
    }

}

/*=============================
## Name function: defaulResultCheckExist
## Describe: Cretae defaul kết quả của check exist
## Params: data, nameRole
## Result: status, message
===============================*/
async function defaulResultCheckExist(data, nameRole) {
    if (data) {
        return {
            message: `${nameRole} đã tồn tại id user`,
            status: false
        };
    }
    return {
        status: true,
        message: `${nameRole} không tồn tại với id User`,
    };
}

/*=============================
## Name function: upLoadImg
## Describe: upload image
## Params: image, name_file
## Result: data: urlAvatar
===============================*/
async function upLoadImg(image, name_file) {
    const uploadRes = await cloudinary.uploader.upload(image, {
        ublic_id: `${Date.now()}`,
        upload_preset: `${name_file}`
    })
    const urlImage = uploadRes.url;
    return {
        urlImage
    }
}
/*=============================
## Name function: createClient
## Describe: tạo Client khi đăng kí
## Params: _idUser, clientInfo
## Result: status, message,data
===============================*/
async function createClient(req, res) {
    try {
        const { _idUser, avatarImage } = req.body;
        const { full_name, phone, birthday, gender, favorit_enres } = req.body.clientInfo;

        const isExists = await checkExistsIdUser(_idUser);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfUser = isExists.user._id

        // Check if the client already exists for this user
        const clientExists = await checkExistsInCliensOrOrganizers(_idOfUser, true);

        if (!clientExists.result.status) {
            return res.status(400).json({
                status: clientExists.status,
                message: clientExists.message,
            });
        }
        let urlImageAvatar;
        if (!avatarImage) {
            urlImageAvatar = process.env.IMG_AVATAR;
        }
        else {
            const dataImgBeforUpload = upLoadImg(avatarImage, "clientOnline");
            console.log("dataImgAfterUpload", (await dataImgBeforUpload).urlImage);
            urlImageAvatar = (await dataImgBeforUpload).urlImage;
        }
        const client = await Client.create({
            user_id: _idOfUser,
            full_name: full_name,
            phone: phone,
            birthday: birthday,
            gender: gender,
            avatarImage: urlImageAvatar,
            favorit_enres: favorit_enres,
        });
        res.status(200).json({
            status: true,
            data: client,
            message: `Client tạo thành công`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: updateClient
## Describe: cập nhật client khi đã đăng nhập
## Params: _idUser, clientInfo
## Result: status, message, data
===============================*/
async function updateClient(req, res) {
    try {
        const { _idClient, avatarImage } = req.body;
        const { full_name, phone, birthday, gender, favorit_enres } = req.body.clientInfo;

        // Kiểm tra sự tồn tại của client
        const client = await Client.findById(_idClient);
        if (!client) {
            return res.status(400).json({
                status: false,
                message: 'Client không tồn tại',
            });
        }

        let urlImageAvatar;
        if (!avatarImage) {
            urlImageAvatar = client.avatarImage;
        }
        else {
            const dataImgBeforUpload = upLoadImg(avatarImage, "clientOnline");
            urlImageAvatar = (await dataImgBeforUpload).urlImage;
        }
        // Cập nhật thông tin client
        client.avatarImage = urlImageAvatar;
        client.full_name = full_name;
        client.phone = phone;
        client.birthday = birthday;
        client.gender = gender;
        client.favorit_enres = favorit_enres;

        // Lưu client đã cập nhật
        const updatedClient = await client.save();

        res.status(200).json({
            status: true,
            data: updatedClient,
            message: 'Cập nhật client thành công',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: createOrganizers
## Describe: tạo organizer khi đăng kí
## Params: _idUser, organizerInfo
## Result: status, message, data
===============================*/
async function createOrganizer(req, res) {
    try {
        const { _idUser, avatarImage } = req.body;
        const { organizer_name, organizer_type, phone, website, founded_date, isActive, description, address, bankCard, bankCardNumber, bankCardName } = req.body.organizerInfo;

        const isExists = await checkExistsIdUser(_idUser);

        if (!isExists.status) {
            return res.status(400).json({
                status: isExists.status,
                message: isExists.message,
            });
        }

        const _idOfUser = isExists.user._id

        // Check if the client already exists for this user
        const organizerExists = await checkExistsInCliensOrOrganizers(_idOfUser, false);

        if (!organizerExists.result.status) {
            return res.status(400).json({
                status: organizerExists.result.status,
                message: organizerExists.result.message,
            });
        }
        let urlImageAvatar;
        if (!avatarImage) {
            urlImageAvatar = process.env.IMG_AVATAR;
        }
        else {
            const dataImgBeforUpload = upLoadImg(avatarImage, "organizerOnline");
            console.log("dataImgAfterUpload", (await dataImgBeforUpload).urlImage);
            urlImageAvatar = (await dataImgBeforUpload).urlImage;
        }
        //Tạo Organizer 
        const organizer = await Organizer.create({
            user_id: _idOfUser,
            organizer_name: organizer_name,
            avatarImage: urlImageAvatar,
            organizer_type: organizer_type,
            phone: phone,
            website: website,
            founded_date: founded_date,
            isActive: isActive,
            description: description,
            address: address,
            bankCard: bankCard,
            bankCardNumber: bankCardNumber,
            bankCardName: bankCardName
        });

        res.status(200).json({
            status: true,
            data: organizer,
            message: `Organizer tạo thành công`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

/*=============================
## Name function: updateOrganizer
## Describe: cập nhật Organizer khi đã đăng nhập
## Params: _idUser, OrganizerInfo
## Result: status, message, data
===============================*/
async function updateOrganizer(req, res) {
    try {
        const { _idOrganizer, avatarImage } = req.body;
        const { organizer_name, organizer_type, phone, website, founded_date, isActive, description, address, bankCard, bankCardNumber, bankCardName } = req.body.organizerInfo;

        // Kiểm tra sự tồn tại của organizer
        const organizer = await Organizer.findById(_idOrganizer);
        if (!organizer) {
            return res.status(400).json({
                status: false,
                message: 'Organizer không tồn tại',
            });
        }

        let urlImageAvatar;
        if (!avatarImage) {
            urlImageAvatar = organizer.avatarImage;
        }
        else {
            const dataImgBeforUpload = upLoadImg(avatarImage, "organizerOnline");
            urlImageAvatar = (await dataImgBeforUpload).urlImage;
        }
        // Cập nhật thông tin organizer
        organizer.avatarImage = urlImageAvatar;
        organizer.organizer_name = organizer_name;
        organizer.organizer_type = organizer_type;
        organizer.phone = phone;
        organizer.website = website;
        organizer.founded_date = founded_date;
        organizer.isActive = isActive;
        organizer.description = description;
        organizer.address = address;
        organizer.bankCard = bankCard;
        organizer.bankCardNumber = bankCardNumber;
        organizer.bankCardName = bankCardName;

        // Lưu organizer đã cập nhật
        const updateOrganizer = await organizer.save();

        res.status(200).json({
            status: true,
            data: updateOrganizer,
            message: 'Cập nhật organizer thành công',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    changePassword,
    createClient,
    createOrganizer,
    updateClient,
    updateOrganizer,
    upLoadImg
};
