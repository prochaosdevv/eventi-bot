const mongoose = require('mongoose');

const eventDateReminderSchema = new mongoose.Schema({
    requestId: {
        type: String,
    },
    eventDateRemindInterval: {
        type: Number, 
    }
});


const eventDateReminder = mongoose.model('eventDateReminder', eventDateReminderSchema);

module.exports = eventDateReminder;
