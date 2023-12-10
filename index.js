const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require("mongoose")
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const sendEmail = require('./routes/sendMailRoutes');
const eventRouter = require('./routes/eventRoutes');
const ticketRouter = require('./routes/ticketRoutes');
const bodyParser = require('body-parser');
const orderRouter = require('./routes/orderRoutes');
const checkinRouter = require('./routes/checkinRoutes');
const refundRouter = require('./routes/refundRoutes');

const notificationNewEvent = require('./controllers/notificationNewEvent');


const adminRouter = require('./routes/adminRoutes');
const ratingRouter = require('./routes/ratingRoutes');
const payBusinessRouter = require('./routes/payBusinessRoutes');

const app = express();

app.use(bodyParser.json({ limit: 'Infinity' }));
app.use(cors());


app.use(express.static('public'));
app.use(express.json({ limit: 'Infinity' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//route to run api login and resign
app.use("/api/auth", authRouter);
//route to api send mail
app.use("/api/sendMail", sendEmail);
//route api event
app.use("/api/event", eventRouter);
//route api ticket
app.use("/api/ticket", ticketRouter);
//route api order
app.use("/api/order", orderRouter);
//route api admin
app.use("/api/admin", adminRouter);
//route api checkin
app.use("/api/checkin", checkinRouter);
//route api rating
app.use("/api/rating", ratingRouter);
//route api refund
app.use("/api/refund", refundRouter);
//route api payBusiness
app.use("/api/payBusiness", payBusinessRouter);

app.use(express.json({ limit: '10mb' }));


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