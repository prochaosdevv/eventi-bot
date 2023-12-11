const mongoose = require('mongoose');

const eventReminderSchema = new mongoose.Schema({
    requestId: {
        type: String,
    },
    remindBefore: {
        type: Number, 
    }
});


const EventReminder = mongoose.model('EventReminder', eventReminderSchema);

module.exports = EventReminder;
