const { body } = require("express-validator");
const { use } = require("passport");
const userService = require("../service/user-service");
// const ApiError = require('../exceptions/api-error');

module.exports = {
  login: async (req, res) => {
    // try {
    //   const { login, password } = req.body;
    //   const userData = await userService.login(login, password);
    //   res.cookie("refreshToken", userData.refreshToken, {
    //     maxAge: 30 * 24 * 60 * 60 * 1000,
    //     httpOnly: true,
    //     sameSite: "none",
    //     secure: true,
    //   });
    //   return res
    //     .status(200)
    //     .json({
    //       user: userData.user,
    //       accessToken: userData.accessToken,
    //       message: "Вы вошли в свой аккаунт",
    //     });
    // }
    try {
      await userService.createRoles();
      await userService.createAdmin();
    }
    catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  authologin: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.authologin(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res
        .status(200)
        .json({
          user: userData.user,
          accessToken: userData.accessToken,
          message: "Вы вошли в свой аккаунт",
        });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res
        .status(200)
        .json({
          user: userData.user,
          accessToken: userData.accessToken,
          message: "Ваш токен изменен",
        });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  updateUserEmail: async(req, res) => {
    try {
      const {newEmail} = req.body;
      await userService.updateUserEmail(req.userData, newEmail);
      return res.status(200).json({ message: "Электронная почта вашего профиля изменена." });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  updateUserPassword: async(req, res) => {
    try {
      const {password, newPassword} = req.body;
      await userService.updateUserPassword(req.userData, password, newPassword);
      return res.status(200).json({ message: "Пароль вашего профиля изменен." });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  createNewUser: async (req, res) => {
    try {
      const { email, login, roles, fullName, phone, region } = req.body;
      await userService.createNewUser(req.userData, {
        email,
        login,
        roles,
        fullName,
        phone,
        region,
      });
      return res.status(200).json({ message: "Новый пользователь создан" });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  getUsersList: async (req, res) => {
    try {
      const usersArrList = await userService.getUsersList();
      return res
        .status(200)
        .json({ users: usersArrList, message: "Список пользователей получен" });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  getUserInfo: async (req, res) => {
    try {
      const info = await userService.getUserInfo(req.userData);
      return res
        .status(200)
        .json({
          userInfo: info,
          message: "Информация о пользователе получена",
        });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  getAnotherUserInfo: async (req, res) => {
    try {
      return res
        .status(200)
        .json({ message: "Информация о пользователе получена" });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  updateUserInfo: async (req, res) => {
    try {
      const { infoType, newValue } = req.body;
      switch (infoType) {
        case "dateBirth":
          await userService.setUserDateBirth(req.userData, newValue);
          break;
        default:
          return res
            .status(401)
            .json({
              errorType: "updateUserInfo",
              message: "Не удалось изменить данные",
            });
      }
      return res.status(200).json({ message: "Данные успешно изменены" });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  deleteUser: async(req, res) => {
    try {
        await userService.deleteUser(req.body.userID);
        return res.status(200).json({ message: "Пользователь удален." });
    }
    catch (e) {
        res.status(e.status).json({ errorType: e.errorType, message: e.message });
      }
  }

  // updateUserData: async(req, res) => {
  //     try {
  //         const { userData, dataType, newValue } = req.body;
  //         await userService.updateUserData(userData, dataType, newValue)
  //         return res.status(200).json({ message: "Данные успешно изменены" });
  //     } catch (e) { res.status(e.status).json({ errorType: e.errorType, message: e.message }); }
  // },
  // createAdmin: async(req, res) => {
  //     try {

  //         await userService.createAdmin();
  //         return res.status(200).json({ message: "Новый админ создан" });
  //     } catch (e) {
  //         res.status(e.status).json({ errorType: e.errorType, message: e.message });
  //     }
  // }
};
