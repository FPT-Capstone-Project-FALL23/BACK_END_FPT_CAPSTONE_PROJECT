const OTP = require("../model/otpModel");
const sendEmail = require("./sendEmail");
const bcrypt = require('bcrypt');
const { AUTH_EMAIL } = process.env;

const sendOTP = async ({ email, subject, message, duration = 1})=>{
    try {
        
        if(!(email && subject && message)){
            throw Error("Provide values for email, subject, message");
        }

        //clear any old record(xóa otp cũ)
        await OTP.deleteOne({ email});

        // generate pin
        const generateOTP = await generateOTP();

        //send email
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject,
            html: `<p>${message}</p><p style="color:tomato;
            font-size:25px;letter-spacing:2px;"><b>${generateOTP}</b></p>
            <p>This code <b>exprires in ${duration} house(s)</b></p>`,
        };
        await sendEmail(mailOptions);

        //save otp record
        const hashedOTP = await bcrypt.hash(generateOTP);
        const newOTP = await new OTP({
            email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 * + duration,
        });

        const createdOTPRecord = await newOTP.save();
        return createdOTPRecord;
    } catch (error) {
        throw error;
    }

    
}



const generateOTP = async () =>  {
    try {
        return (opt = `${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (error) {
        throw error;
    }
}


module.exports = generateOTP;
module.exports = { sendOTP };