const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    experience: {
        type: Number,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    photo: {
        type: String,
        required: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
        googleMapsUrl: {
            type: String,
            required: true
        }
    }
});

doctorSchema.index({ location: "2dsphere" });

const DoctorModel = mongoose.model("doctor", doctorSchema);

module.exports = {
    DoctorModel,
};