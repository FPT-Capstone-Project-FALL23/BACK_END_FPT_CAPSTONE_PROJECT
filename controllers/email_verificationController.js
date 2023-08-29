// const User = require('../model/UsersModel');
// const { sendOTP } = require()


// const sendVerificationOTPEmail = async (email) => {
//     try {
//         // check if an accout exists
//         const existingUser = await User.findOne({ email });
//         if (!existingUser){
//             throw Error("There's no account for the provided email.");
//         }

//         const otpDetails = {
//             email,
//             subject: "Email Verification",
//             message: "Verify you email with the code below.",
//             duration: 1,
//         };
//     } catch (error) {
        
//     }
// }