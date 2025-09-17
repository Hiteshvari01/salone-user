const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, trim: true},
    specialization: { type: String, trim: true},
    image: {
        url: { type: String},
        filename: { type: String}
    }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema, 'staffs');
