const mongoose          = require('mongoose');
const AutoIncrement     = require('mongoose-sequence')(mongoose);
const Schema            = mongoose.Schema;

let pageSchema = Schema({
    pageid: {
        type: Number
    },
    title: {
        type: String
    },
    layout: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    pagecontent: {
        type: Object
    }
});

pageSchema.plugin(AutoIncrement, {inc_field: 'pageid'});
let Page = module.exports = mongoose.model('Page', pageSchema);