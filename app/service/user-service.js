const User = require("../models/user");
const Role = require("../models/role");
const generateError = require("../exceptions/api-error");
const bcrypt = require("bcrypt");
const Dto = require("../dtos/index");
const tokenService = require("./token-service");
const passwordGenerator = require("password-generator");
const mailer = require("../mailer");
const userInfo = require("../models/userInfo");
const token = require("../models/token");

module.exports = {
  login: async (login, password) => {
    const user = await User.findOne({
      $or: [{ username: login }, { email: login }],
    }).populate("roles", "value");
    if (!user) {
      throw generateError.BadRequest(
        401,
        "userNotFound",
        "Пользователь не найден"
      );
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw generateError.BadRequest(401, "invalidPassword", "Неверный пароль");
    }
    const userDto = Dto.user(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  },
  authologin: async (refreshToken) => {
    if (!refreshToken) {
      throw generateError.BadRequest(
        401,
        "unauthorizedError",
        "Неавторизованный пользователь"
      );
    }
    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw generateError.BadRequest(
        401,
        "unauthorizedError",
        "Попробуйте войти снова."
      );
    }
    const user = await User.findById(userData.id).populate("roles");
    const userDto = Dto.user(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  },
  logout: async (refreshToken) => {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  },
  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw generateError.BadRequest(
        401,
        "unauthorizedError",
        "Неавторизованный пользователь"
      );
    }
    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw generateError.BadRequest(
        401,
        "unauthorizedError",
        "Неавторизованный пользователь"
      );
    }
    const user = await User.findById(userData.id).populate("roles");
    const userDto = Dto.user(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  },

  //Обновление данных для логина
  updateUserEmail: async (userData, newEmail) => {
    if (newEmail) {
      const changeableUser = await User.findOne({ _id: userData.id });
      // changeableUser.unconfirmedMail = 'test';
      const mailToken = tokenService.generateMailToken(
        changeableUser._id,
        changeableUser.email,
        newEmail
      );
      const messageOptions = {
        message_type: "changeUserEmail",
        to: newEmail,
        id: changeableUser._id,
        token:mailToken,
      };
      console.log(messageOptions)
      // let status = await mailer(messageOptions);
      // if (status) {
      //   // changeableUser.email = newEmail;
      // } else {
      //   throw generateError.BadRequest(
      //     401,
      //     "createUserError",
      //     "Проверьте почту или попробуйте позже."
      //   );
      // }
      // changeableUser.email = newEmail;
      // changeableUser.save();
      // console.log(changeableUser);
    } else {
      throw generateError.BadRequest(
        401,
        "createUserError",
        "Проверьте почту или попробуйте позже."
      );
    }
  },
  updateUserPassword: async (userData, password, newPassword) => {
    const changeableUser = await User.findOne({ _id: userData.id });
    const isPassEquals = await bcrypt.compare(
      password,
      changeableUser.password
    );
    if (!isPassEquals) {
      throw generateError.BadRequest(401, "invalidPassword", "Неверный пароль");
    }
  },
  //Создания пользователей
  createNewUser: async (userData, newUserValue) => {
    if (newUserValue.email && newUserValue.login) {
      // //Проверка существования пользователя
      const searchEmailUser = await User.findOne({ email: newUserValue.email });
      if (searchEmailUser) {
        throw generateError.BadRequest(
          401,
          "createUserError",
          "Пользователь с такой почтой уже существет."
        );
      }
      const searchLoginUser = await User.findOne({
        username: newUserValue.login,
      });
      if (searchLoginUser) {
        throw generateError.BadRequest(
          401,
          "createUserError",
          "Пользователь с таким логином уже существет."
        );
      }
      const rolesArr = newUserValue.roles.split(",");
      //Права пользователя
      let rolesValueArr = [];
      const requireUserRole = await Role.findOne({ value: "USER" });
      rolesValueArr.push(requireUserRole._id);
      for (let value of rolesArr) {
        let roleValue = await Role.findOne({ value: value });
        if (roleValue && roleValue._id) {
          rolesValueArr.push(roleValue._id);
        }
      }
      //Генерация пароля
      const generatePassword = passwordGenerator(8, false, /[\w\W\d\p]/);
      const messageOptions = {
        message_type: "createUser",
        to: newUserValue.email,
        user_login: newUserValue.login,
        user_password: generatePassword,
      };
      let status = await mailer(messageOptions);
      if (status) {
        const newUser = new User({
          email: newUserValue.email.toLowerCase(),
          username: newUserValue.login,
          password: generatePassword,
          roles: rolesValueArr,
          region: newUserValue.region,
        });
        if (newUser) {
          try {
            const newUserInfo = new userInfo({
              userId: newUser._id,
              contactEmail: newUserValue.email,
              fullName: newUserValue.fullName,
              phone: newUserValue.phone,
            });
            await newUserInfo.save();
          } catch (error) {
            console.log(error);
          }
        }
        await newUser.save();
      } else {
        throw generateError.BadRequest(
          401,
          "createUserError",
          "Сообщение с данными о регистрации не может быть доставлено. Проверьте почту или попробуйте позже."
        );
      }
    } else {
      throw generateError.BadRequest(
        401,
        "createUserError",
        "Поля, для создания нового пользователя, не могут быть пустыми."
      );
    }
  },
  createRoles: async() => {
    let Role = await new Role();
    Role.save();
    Role = await new Role({value: "MANAGER"}) ;
    Role.save();
    Role = await new Role({value: "ADMIN"});
    Role.save();
  },
  createAdmin: async() => {
      const email = 'dev@artgorka.ru';
      const login = 'dev_admin';
      const password = 'admin';
      let rolesValueArr = [];
      const requireUserRole = await Role.findOne({ value: "USER" });
      rolesValueArr.push(requireUserRole._id);
      const requireUserRole2 = await Role.findOne({ value: "MANAGER" });
      rolesValueArr.push(requireUserRole2._id);
      const requireUserRole3 = await Role.findOne({ value: "ADMIN" });
      rolesValueArr.push(requireUserRole3._id);
      const newUser = await new User({ email: email, username: login, password: password, roles: rolesValueArr, fullName:'Кузнецов Павел Александрович',phone: '89539034202', region: 'VN' })
      await newUser.save();
      console.log(newUser);
  },

  getUsersList: async () => {
    try {
      const userList = await User.find(
        {},
        { email: 1, username: 1, roles: 1, region: 1, createdAt: 1 }
      )
        .populate({ path: "roles", select: "value -_id" })
        .populate({
          path: "user_info",
          model: userInfo,
          select: "fullName contactEmail phone dateBirth -_id",
        });
      let dtoUserList = [];
      for (i in userList) {
        const user = userList[i];

        dtoUserList[i] = {
          _id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles ? user.roles.map((e) => e.value) : "",
          region: user.region,
          user_info: user.user_info ? user.user_info : "",
          createdDate: user.createdAt,
        };
      }
      return dtoUserList;
    } catch (err) {
      console.log(err);
      throw generateError.BadRequest(
        401,
        "getUsersList",
        "Не удалось получить список пользователя."
      );
    }
  },
  //Получение информации о пользователе
  getUserInfo: async (userData) => {
    try {
      const info = userInfo
        .findOne({ userId: userData.id })
        .select("-_id -userId -__v")
        .lean();
      if (info) {
        return info;
      } else {
        throw generateError.BadRequest(
          401,
          "getUserInfo",
          "Не удалось получить информацию о пользователе."
        );
      }
    } catch (err) {
      throw generateError.BadRequest(
        401,
        "getUserInfo",
        "Не удалось получить информацию о пользователе."
      );
    }
  },

  //Изменение информации о пользовате
  setUserDateBirth: async (userData, newValue) => {
    try {
      await userInfo.findOneAndUpdate(
        { userId: userData.id },
        { dateBirth: newValue }
      );
    } catch (err) {
      throw generateError.BadRequest(
        401,
        "updateUserInfo",
        "Не удалось обновить данные о пользователе."
      );
    }
  },

  deleteUser: async (userID) => {
    try {
      await userInfo.deleteOne({ userId: userID });
      await token.deleteOne({ user: userID });
      await User.deleteOne({ _id: userID });
    } catch {
      throw generateError.BadRequest(
        401,
        "deleteUser",
        "Не удалось удалить пользователя."
      );
    }
  },
};
