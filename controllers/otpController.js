const { authenticator } = require('otplib');

/*=============================
## Name function: generateOTP
## Describe: Tạo otp và time của otp 
## Params: 
## Result: otp, expirationTime
===============================*/
function generateOTP() {
    // Tạo mã OTP
    const secret = authenticator.generateSecret();
    const otp = authenticator.generate(secret);
    var checkExist = true;
    // In ra mã OTP
    console.log('Mã OTP:', otp);

    // Tính thời gian hết hạn (3 phút)
    const expirationTime = Date.now() + 3 * 60 * 1000; // OTP hết hạn sau 3 phút

    return { otp, expirationTime }
}

module.exports = { generateOTP }