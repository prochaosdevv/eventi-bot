const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        require: true,
    },
    subscriptionEnd: {
        type: Number,
        require: true,
    },
    subscriptionType: {
        type: Number,
        require: true,
    },
    subscriptionTypeValue: {
        type: String,
        require: true,
    }
}, {
    timestamps: true,
  });

const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

module.exports = SubscriptionModel;
