const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require("mongoose")
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const sendEmail = require('./routes/sendMailRoutes');

const app = express();

app.use(cors());
app.use(express.json())

//route to run api login and resign
app.use("/api/auth", authRouter);
//route to api send mail
app.use("/api/sendMail", sendEmail);


//Connect with monogdb
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB connection successfull");
}).catch((err) => {
    console.log(err.message)
})

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`)
    console.log(`Link server http://localhost:${process.env.PORT}/`)
})