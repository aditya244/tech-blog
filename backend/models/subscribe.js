const mongoose = require('mongoose');

const SubscriptionDataSchema = mongoose.Schema({
    email: {type: String},
    subscriptionDate: {type: Date}
})

module.exports = mongoose.model('SubscriptionDataSchema', SubscriptionDataSchema);
