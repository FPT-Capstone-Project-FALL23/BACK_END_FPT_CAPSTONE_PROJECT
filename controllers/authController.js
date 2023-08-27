const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/UsersModel');


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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                error: 'User not found'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                status: false,
                error: 'Invalid password'
            });
        }

        //tạo token
        const token = generateToken(user);
        res.status(200).json({
            status: true,
            token: token,
            data: user
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
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
## Params: email, password, role, data_info
## Result: status, data, message
===============================*/
async function registerUser(req, res) {
    try {
        const { email, password, role, data_info } = req.body;

        // kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ $or: [{ email }] });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                error: 'Username or email already taken'
            });
        }

        // Hash mật khẩu trước khi lưu nó
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            email: email,
            password: hashedPassword,
            role: role,
        });

        if (role === 'client') {
            newUser.client_info = data_info;
        } else if (role === 'organizer') {
            newUser.organizer_info = data_info;
        }

        await newUser.save();

        res.status(200).json({
            status: true,
            data: newUser,
            message: `${role} registered successfully`
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = {
    loginUser,
    logoutUser,
    registerUser
};
