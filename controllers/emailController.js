const { generateOTP } = require('./otpController');
const { sendMailToUser, AUTH_EMAIL } = require('./sendEmail');
const User = require('../model/usersModel');
const { htmlMailActiveEvent, htmlMailActiveOrganizer, htmlOTP, htmlsendTicketByEmail, htmlMailRejectOrganizer, htmlMailRejectEvent, htmlMailRequestRefundMoney, htmlMailNoticeChangeEventDate } = require("../config/constHTML");

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

        // kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: 'Email đã tồn tại'
            });
        }
        else {
            const generOTP = generateOTP();
            const otp = generOTP.otp;
            const expirationTime = generOTP.expirationTime;

            otpStorage[email] = { otp, expirationTime }; //Lưu trữ OTP và time để xác thực sau
            const htmlOTPForMail = htmlOTP(otp);
            const mailOptions = {
                from: AUTH_EMAIL,
                to: email,
                subject: 'TIKSEAT: Mã OTP để xác minh tài khoản',
                html: htmlOTPForMail,
            };

            sendMailToUser(mailOptions).then(() => {
                res.status(200).json({ status: true, message: 'OTP đã được gửi thành công' });
            }).catch((error) => {
                res.status(400).json({ status: false, message: 'Error sending OTP' });
            });
        }
    } catch (err) {
        res.status(500).json({ status: 'False', message: "Lỗi ", err });
    }
}

/*=============================
## Name function: resendOTPForMail
## Describe: Resend mail otp khi user chọn resend
## Params: email
## Result: status, message
===============================*/
async function resendOTPForMail(req, res) {
    try {
        const { email } = req.body;
        const storedData = otpStorage[email];
        const currentTime = Date.now();

        if (storedData) {
            const { expirationTime } = storedData;
            if (currentTime < expirationTime) {
                delete otpStorage[email]; // Remove expired OTP data
            }
        }
        const generOTP = generateOTP();
        const otp = generOTP.otp;
        const resendExpirationTime = generOTP.expirationTime;
        otpStorage[email] = { otp, resendExpirationTime }; //Lưu trữ OTP và time để xác thực sau
        const htmlOTPForMail = htmlOTP(otp);
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject: 'TIKSEAT: Mã OTP để xác minh tài khoản',
            html: htmlOTPForMail,
        };

        sendMailToUser(mailOptions).then(() => {
            res.status(200).json({ status: true, message: 'OTP đã được gửi thành công' });
        }).catch((error) => {
            res.status(400).json({ status: false, message: 'Error sending OTP' });
        });
    } catch (err) {
        res.status(500).json({ status: 'False', message: "Lỗi ", err });
    }
}

/*=============================
## Name function: sendOTPForMailRegister
## Describe: Send mail otp khi register cho user
## Params: email
## Result: status, message
===============================*/
async function sendOTPForResetPassword(req, res) {
    try {
        const { email } = req.body;

        // kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(409).json({
                status: false,
                message: 'Email không tồn tại'
            });
        }
        else {
            const generOTP = generateOTP();
            const otp = generOTP.otp;
            const expirationTime = generOTP.expirationTime;

            otpStorage[email] = { otp, expirationTime }; //Lưu trữ OTP và time để xác thực sau
            const htmlOTPForMail = htmlOTP(otp);
            const mailOptions = {
                from: AUTH_EMAIL,
                to: email,
                subject: 'TIKSEAT: Mã OTP để RESET PASSWORD',
                html: htmlOTPForMail,
            };

            sendMailToUser(mailOptions).then(() => {
                res.json({ status: true, message: 'OTP đã được gửi thành công' });
            }).catch((error) => {
                res.json({ status: false, message: 'Error sending OTP' });
            });
        }
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
            return res.status(400).json({ status: false, message: 'OTP không được tạo cho email này' });
        }
        const { otp, expirationTime } = storedData;
        const currentTime = Date.now();

        if (currentTime > expirationTime) {
            delete otpStorage[email]; // Remove expired OTP data
            return res.status(400).json({ status: false, message: 'OTP đã hết hạn' });
        }

        if (otp == enteredOTP) {
            // OTP matches and is not expired, do something (e.g., mark email as verified)
            res.status(200).json({ status: true, message: 'OTP hợp lệ' });
            delete otpStorage[email]; // Remove expired OTP data
        } else {
            res.status(400).json({ status: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        res.status(500).json({ status: 'False', message: "Lỗi ", err });
    }
}

/*=============================
## Name function: sendEmailActiveOrganizer
## Describe: Gửi mail cho tổ chức khi phê duyệt
## Params: email
## Result: none
===============================*/
async function sendEmailActiveOrganizer(email, organizer) {
    const htmlActive = htmlMailActiveOrganizer(organizer)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: ACCOUNT HAS BEEN ACTIVATED',
        html: htmlActive,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendEmailRejectOrganizer
## Describe: Gửi mail cho tổ chức khi bị từ chối
## Params: email
## Result: none
===============================*/
async function sendEmailRejectOrganizer(email, organizer) {
    const htmlActive = htmlMailRejectOrganizer(organizer)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: ACCOUNT HAS BEEN REJECT',
        html: htmlActive,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendEmailActiveEvent
## Describe: Gửi mail cho tổ chức khi phê duyệt event
## Params: email, organizer, event
## Result: none
===============================*/
async function sendEmailActiveEvent(email, organizer, event) {
    const htmlEmail = htmlMailActiveEvent(organizer, event)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: EVENT HAS BEEN ACTIVATED',
        html: htmlEmail,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendEmailRejectEvent
## Describe: Gửi mail cho tổ chức khi bị từ chối event
## Params: email, organizer, event
## Result: none
===============================*/
async function sendEmailRejectEvent(email, organizer, event) {
    const htmlEmail = htmlMailRejectEvent(organizer, event)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: EVENT HAS BEEN REJECTED',
        html: htmlEmail,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendTicketByEmail
## Describe: Gửi vé đến email
## Params: email, client, buffers
## Result: 
===============================*/
async function sendTicketByEmail(email, client, buffers) {
    // Nội dung email
    const htmlEmail = htmlsendTicketByEmail(client);
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: 'TIKSEAT: PURCHASE OF TICKETS SUCCESSFULLY',
        html: htmlEmail,
        attachments: buffers.map((pdf, index) => ({
            filename: `TIKSEAT_ticket_${index + 1}.pdf`,
            content: pdf,
            encoding: 'base64',
        })),
    };

    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendEmailRequestRefundMoney
## Describe: Gửi mail cho tổ chức khi client gửi request chưa nhận tiền
## Params: email
## Result: none
===============================*/
async function sendEmailRequestRefundMoney(emailClient, emailOrganizer, organizer_name, event) {
    // console.log("emailClient", emailClient);
    // console.log("emailOrganizer", emailOrganizer);
    // console.log("event", event.event_name);
    const htmlActive = htmlMailRequestRefundMoney(emailClient, organizer_name, event)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: emailOrganizer,
        cc: emailClient,
        subject: 'TIKSEAT: REFUND NOT RECEIVED',
        html: htmlActive,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

/*=============================
## Name function: sendEmailRequestRefundMoney
## Describe: Gửi mail cho tổ chức khi client gửi request chưa nhận tiền
## Params: email
## Result: none
===============================*/
async function sendEmailNoticeChangeEventDate(emailClient, event, dateEvent) {

    const htmlActive = htmlMailNoticeChangeEventDate(emailClient, event, dateEvent)
    const mailOptions = {
        from: AUTH_EMAIL,
        to: emailClient,
        // cc: emailClient,
        subject: 'TIKSEAT: CHANGE IN EVENT DATE',
        html: htmlActive,
    };
    // Gửi email
    sendMailToUser(mailOptions)
}

module.exports = {
    sendOTPForMailRegister, sendOTPForResetPassword, verifileOTPRegister, resendOTPForMail,
    sendEmailActiveOrganizer, sendEmailActiveEvent, sendTicketByEmail, sendEmailRejectOrganizer,
    sendEmailRejectEvent, sendEmailRequestRefundMoney, sendEmailNoticeChangeEventDate
};