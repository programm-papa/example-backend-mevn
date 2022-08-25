const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Token = require('../models/token');
const config = require('@config');
module.exports = {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, config.secret, { expiresIn: '100m' });
        const refreshToken = jwt.sign(payload, config.secretSpecial, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        }
    },
    async validateAccessToken(token) {
        try {
            let userData = jwt.verify(token, config.secret);
            const user = await User.findOne({ _id: userData.id }).populate('roles', 'value');
            for (let i = 0; i < user.roles.length; i++) {
                if (!userData.roles.includes(user.roles[i].value)) {
                    throw generateError.BadRequest(401, 'reqError', 'В вашем запросе есть измененные данные, обновите приложение!');
                }
            }
            return { login: userData.login, id: userData.id, roles: userData.roles, region: user.region };
        } catch (e) {
            return null;
        }
    },
    async validateRefreshToken(refreshToken) {
        try {
            let userData = jwt.verify(refreshToken, config.secretSpecial);
            return userData;
        } catch (e) {
            return null;
        }
    },
    async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }
        const token = await Token.create({ user: userId, refreshToken });
        return token;
    },
    async removeToken(refreshToken) {
        const tokenData = await Token.deleteOne({ refreshToken });
        return tokenData;
    },
    async findToken(refreshToken) {
        const tokenData = await Token.findOne({ refreshToken });
        return tokenData;
    },
    //Генерация токена обновления почты
    async generateMailToken(userId, email, newEmail) {
        return jwt.sign({userId, email}, newEmail, { expiresIn: '120m' });
    },
}