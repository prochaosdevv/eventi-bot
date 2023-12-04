const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        default: false,
    },
    requestId: {
        type: String,
        default: false,
    },
    eventName: {
        type: String,
        default: false,
    },
    eventPad: {
        type: String,
        default: false,
    },
    eventChain: {
        type: String,
        default: false,
    },
    eventLink: {
        type: String,
        default: false,
    },
    eventTwitter: {
        type: String,
        default: false,
    },
    communityLink: {
        type: String,
        default: false,
    },
    eventDate: {
        type: String,
        default: false,
    },
    remindBefore: {
        type: String,
        default: false,
    },
    eventDateRemindInterval: {
        type: String,
        default: false,
    },
    currentField: {
        type: String,
        default: false,
    },
    eventTime: {
        type: String,
        default: false,
    },
}, {
    timestamps: true,
  });

const RequestModel = mongoose.model('Request', requestSchema);

module.exports = RequestModel;
