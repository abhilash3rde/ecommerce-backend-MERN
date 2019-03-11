let mongoose = require('mongoose');
let inquirySchema = mongoose.Schema({
    inquiryno: {
        type: Number,
        required: true
    },
    inquirydate: {
        type: Date,
        required: true,
        default: Date.now
    },
    inquirymiliseconds: {
        type: Number,
        required: true
    },
    inqdescription: {
        type: String,
        required: true
    },
    remark: {
        type: String
    },
    userid: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        trim: true
    },
    filename: {
        type: String
    }
});

let Inquiry = module.exports = mongoose.model('Inquiry', inquirySchema);