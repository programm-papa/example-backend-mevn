const tokenService = require('../service/token-service');
const generateError = require('../exceptions/api-error');

module.exports = async(req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw generateError.BadRequest(401, 'unauthorizedError', 'Неавторизованный запрос');
        }
        const token = req.headers.authorization.split(" ")[1];
        const userData = await tokenService.validateAccessToken(token);
        if (!userData) {
            throw generateError.BadRequest(401, 'expiredToken', 'Токен устарел');
        }
        req.userData = userData;
        next();
    } catch (err) {
        res.status(err.status).json({ errorType: err.errorType, message: err.message });
    }
}