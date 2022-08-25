const mongoose = require('mongoose');

const userInfoSchema = mongoose.Schema({
    //Данные о пользователе
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    fullName: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    dateBirth: { type: String, default: "" },
})

module.exports = mongoose.model('UserInfo', userInfoSchema);