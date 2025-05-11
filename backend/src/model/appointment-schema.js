const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "user",
        required: true
    },
    doctorId: {
        type: String,
        ref: "doctor",
        required: true
    },
    timeslot: {
        type: Date, // Start time of the half-hour slot
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled"],
        default: "scheduled"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AppointmentModel = mongoose.model("appointment", appointmentSchema);

module.exports = {
    AppointmentModel,
};