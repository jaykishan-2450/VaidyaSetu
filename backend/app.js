require("dotenv").config();
require("./src/config/db.js");

const express = require("express");
const cors = require("cors");

const { doctorRouter } = require("./src/api/doctor.js");
const { appointmentRouter } = require("./src/api/appointment.js");
const { userRouter } = require("./src/api/user.js");
const { sendOtpController } = require("./src/api/auth/otp");


const PORT = 3000;

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", sendOtpController);

app.listen(PORT, () => {
    console.log(`---App is running on http://localhost:${PORT}`);
});