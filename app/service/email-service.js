const { set } = require('../../config/mail-send');
const mailTransporter = require('../../config/mail-send');

module.exports = {
    sendRecoveryMail: async(specialRecoveryToken, id) => {
        const recoveryLink = '...recovery link mask...?key=' + specialRecoveryToken + '?id=' + id;
        console.log(recoveryLink); 
        return true;
    },
}