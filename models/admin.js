const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminName:{type: String, required: true, trim: true},
    yearsOfExperience: { type: Number, required: true, default: 0 },
    happyCustomers: { type: Number, required: true, default: 0 },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    aboutUsText: { type: String, required: true, trim: true },
    discountOfferPercentage: { type: Number, default: 0 },
    discountOfferText: { type: String, trim: true },
    footerAboutText: { type: String, trim: true },
    profileImage: {                     // ✅ Profile image field
        url: String,
        filename: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema, 'admins');
