const { generateOTP } = require('./otpController');
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');



// Lưu trữ OTP được tạo và thời gian hết hạn
const otpStorage = {};

/*=============================
## Name function: sendOTPForMailRegister
## Describe: Send mail otp khi register cho user
## Params: email
## Result: status, message
===============================*/
async function sendOTPForMailRegister(req, res) {
    try {
        const { email } = req.body;
        const generOTP = generateOTP();
        const otp = generOTP.otp;
        const expirationTime = generOTP.expirationTime;

        otpStorage[email] = { otp, expirationTime }; //Lưu trữ OTP và time để xác thực sau

        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject: 'TIKSEAT: Mã OTP để xác minh tài khoản',
            html: `<p>Mã xác minh tài khoản Tikseat của bạn là:</p>
            <p style="color:tomato;font-size:25px;letter-spacing:2px;">
            <b>${otp}</b>
            </p>
            <p>Có hiệu lực trong <b>3 phút.</b>.KHÔNG chia sẻ mã này với người khác</p>`,
        };

        sendMailToUser(mailOptions).then(() => {
            res.json({ status: true, message: 'OTP đã được gửi thành công' });
        }).catch((error) => {
            res.json({ status: false, message: 'Error sending OTP' });
        });
    } catch (err) {
        res.json({ status: 'False', message: "Lỗi ", err });
    }
}

/*=============================
## Name function: verifileOTPRegister
## Describe: Verifile của otp khi gửi
## Params: email,enteredOTP
## Result: status, message
===============================*/
async function verifileOTPRegister(req, res) {
    try {
        const { email, enteredOTP } = req.body;

        const storedData = otpStorage[email];
        if (!storedData) {
            return res.json({ status: false, message: 'OTP không được tạo cho email này' });
        }
        const { otp, expirationTime } = storedData;
        const currentTime = Date.now();

        if (currentTime > expirationTime) {
            delete otpStorage[email]; // Remove expired OTP data
            return res.json({ status: false, message: 'OTP đã hết hạn' });
        }

        if (otp == enteredOTP) {
            // OTP matches and is not expired, do something (e.g., mark email as verified)
            res.json({ status: true, message: 'OTP hợp lệ' });
            delete otpStorage[email]; // Remove expired OTP data
        } else {
            res.json({ status: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        res.json({ status: 'False', message: "Lỗi ", err });
    }
}

module.exports = { sendOTPForMailRegister, verifileOTPRegister };