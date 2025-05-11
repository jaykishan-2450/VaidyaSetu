const express = require("express");
const mongoose =  require("mongoose");
const { AppointmentModel } = require("../model/appointment-schema");
const { sendMail } = require("./auth/email-helper");
const { UserModel } = require("../model/user-schema");
const { DoctorModel } = require("../model/doctor-schema");


const appointmentRouter = express.Router();

// Create new appointment
function validateAppointment(req, res, next) {
  const { userId, doctorId, timeslot } = req.body;
  if (!userId || !doctorId || !timeslot) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  next();
};

appointmentRouter.post("/", validateAppointment, async (req, res) => {
  try {
    const { userId, doctorId, timeslot } = req.body;

    // ...existing conflict check...

    const appointment = new AppointmentModel({ userId, doctorId, timeslot });
    await appointment.save();

    // Fetch patient and doctor details
    const user = await UserModel.findById(userId);
    const doctor = await DoctorModel.findById(doctorId);

    if (user && doctor) {
      const appointmentTime = new Date(timeslot);
      const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hour before

      const delay = reminderTime.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          sendMail({
            emails: [user.email],
            subejct: `Your appointment with Dr. ${doctor.name} is in 1 hour`,
            html: `
              <html>
                <body>
                  <h2>Appointment Reminder</h2>
                  <p>Your appointment with Dr. ${doctor.name} is scheduled at ${appointmentTime.toLocaleString()}.</p>
                  <p>Clinic Location: <a href="${doctor.location.googleMapsUrl}">${doctor.location.googleMapsUrl}</a></p>
                  <p>Click the link for Google Maps driving instructions.</p>
                </body>
              </html>
            `
          })
          .then(() => {
      console.log(`Reminder email sent to ${user.email} for appointment at ${appointmentTime.toISOString()}`);
    })
          .catch(console.error);
        }, delay);
      }
    }

    res.status(201).json({ message: "Appointment created successfully" });
  } catch (err) {
    res.status(400).json({ message: "Appointment creation failed", error: err.message });
  }
});



appointmentRouter.get("/", async (req, res) => {
  try {
    const { userId, doctorId } = req.query;
    const filter = {};
    // if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    // if (doctorId) filter.doctorId = new mongoose.Types.ObjectId//(doctorId);

     if (userId) filter.userId = (userId);
    if (doctorId) filter.doctorId = (doctorId);

    const appointments = await AppointmentModel.find(filter);
    res.status(200).json({ appointments });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: err.message });
  }
});



// Cancel an appointment
appointmentRouter.put("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (err) {
    res.status(400).json({ message: "Failed to cancel appointment", error: err.message });
  }
});



module.exports = { appointmentRouter };
