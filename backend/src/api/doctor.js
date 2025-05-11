const express = require("express");
const { DoctorModel } = require("../model/doctor-schema");
const { UserModel } = require("../model/user-schema");

const doctorRouter = express.Router();


// Get doctors by distance (optionally filtered by speciality)

doctorRouter.get("/", async (req, res) => {
    try {
        const { userId, speciality } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Get user's location from DB
        const user = await UserModel.findById(userId);
        if (!user || !user.location || !user.location.coordinates) {
            return res.status(404).json({ message: "User location not found" });
        }
        const [lng, lat] = user.location.coordinates;

        const geoQuery = {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            spherical: true
        };
        if (speciality) {
            geoQuery.query = { speciality };
        }

        const doctors = await DoctorModel.aggregate([
            { $geoNear: geoQuery },
            { $limit: 10 }
        ]);
        doctors.forEach(doc => doc.distance = (doc.distance / 1000).toFixed(2)); // meters to km
        return res.json(doctors);

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = { doctorRouter };