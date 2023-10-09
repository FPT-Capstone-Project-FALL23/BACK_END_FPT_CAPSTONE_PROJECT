const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const AUTH_EMAIL = process.env.AUTH_EMAIL;
// const AUTH_PASS = "lfcgmaqhavidpixc"; // mật khẩu ứng dụng
// const PASS = "tikseat123456@" //mậu khẩu để vào mail tikseat.fall2023@gmail.com


/*=============================
## Name function: transporter
## Describe: Tạo một transporter để gửi email
## Params: 
## Result: 
===============================*/
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: AUTH_EMAIL, // Địa chỉ email của bạn
        pass: process.env.AUTH_PASS // Mật khẩu email của bạn
    }
});

/*=============================
## Name function: sendMailToUser
## Describe: Gửi email cho user
## Params: mailOptions
## Result: 
===============================*/
function sendMailToUser(mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports = { sendMailToUser, AUTH_EMAIL };