const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [0, 0] // <-- Default coordinates
        },
        googleMapsUrl: {
            type: String,
            default: "" // <-- Default empty string
        }
    }
});

userSchema.index({ location: "2dsphere" });

const UserModel = mongoose.model("user", userSchema);

module.exports = {
    UserModel,
};