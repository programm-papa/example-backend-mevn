const tokenService = require('../service/token-service');
const generateError = require('../exceptions/api-error');

module.exports = async(req, res, next) => {
    try {
        const userData = req.userData
        if (userData.roles.includes('ADMIN') || userData.roles.includes('MANAGER')) {
            next();
        } else {
            throw generateError.BadRequest(401, 'reqError', 'У вас недостаточно прав для действия.');
        }

    } catch (err) {
        res.status(err.status).json({ errorType: err.errorType, message: err.message });
    }
}