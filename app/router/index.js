const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const orderController = require("../controllers/order-controller");
const router = new Router();
const { body } = require("express-validator");
const { check } = require("express-validator");
const tokenVerification = require("../middleware/acces-token-middleware");
const specialRoleVerification = require("../middleware/acces-special-roles-middleware");
// const authMiddleware = require('../middlewares/auth-middleware');

// router.post('/registration',
//     body('email').isEmail(),
//     body('password').isLength({min: 3, max: 32}),
//     userController.registration
// );
// router.post('/login', userController.login);
// router.post('/logout', userController.logout);
// router.get('/activate/:link', userController.activate);
// router.get('/refresh', userController.refresh);
// router.get('/users', authMiddleware, userController.getUsers);
router.get("", (req, res) => {
  res.json({ message: "API работает нормально" });
});
//Роуты для работы с данными пользователя
router.post("/login", userController.login);
router.post("/logout", tokenVerification, userController.logout);
router.post("/authologin", userController.authologin);
router.post(
  "/updateUserEmail",
  tokenVerification,
  userController.updateUserEmail
);
router.post(
  "/updateUserPassword",
  tokenVerification,
  userController.updateUserPassword
);
router.post(
  "/createUser",
  tokenVerification,
  specialRoleVerification,
  userController.createNewUser
);
router.post(
  "/updateUserInfo",
  tokenVerification,
  userController.updateUserInfo
);
router.post(
  "/deleteUser",
  tokenVerification,
  specialRoleVerification,
  userController.deleteUser
);
//Роуты для работы с заказами
router.post(
  "/createOrder/graveImprovement",
  tokenVerification,
  orderController.createOrderGraveImprovement
);
// router.post('/admin', userController.createAdmin);
// router.post('/updatePassword', )
// router.post('/test', data)

router.get("/refresh", userController.refresh);
router.get(
  "/users",
  tokenVerification,
  specialRoleVerification,
  userController.getUsersList
);
router.get("/userInfo", tokenVerification, userController.getUserInfo);
// router.get('/user/data', userController.userData);
//Роуты для работы с заказами
router.get("/orderList", tokenVerification, orderController.getOrderList);

module.exports = router;
