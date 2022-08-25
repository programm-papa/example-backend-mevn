const nodemailer = require('nodemailer')
const createUserMsgTplt = require('./createUserMsgTplt')
const generateError = require('../exceptions/api-error')
let transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'kpavel_wrk@mail.ru',
        pass: 'jEgf1qfvpzWFGzbshY06',
    },

}, {
    from: 'Mailer Test <kpavel_wrk@mail.ru>',
})

const mailer = async(messageOptions) => {
    let message = {
        from: 'приложение "МАРТ" <kpavel_wrk@mail.ru>',
        to: messageOptions.to,
    };
    if (messageOptions.message_type == 'createUser') {
        message.subject = 'Данные о вашем аккаунте для приложения "МАРТ"';
        message.html = createUserMsgTplt({...messageOptions });
    }
    try {
        await transporter.sendMail(message);
        return true;
    } catch (err) {
        return false;
    }
}
module.exports = mailer;