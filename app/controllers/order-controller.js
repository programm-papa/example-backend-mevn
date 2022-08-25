const { body } = require("express-validator");
const { use } = require("passport");
const orderService = require("../service/order-service");
// const ApiError = require('../exceptions/api-error');

module.exports = {
  createOrderGraveImprovement: async (req, res) => {
    try {
      const {
        customer,
        deceased,
        addedServiceGravelOrder,
        additionalServices,
        amount,
        paymentType,
        discount,
        discountType,
        prepayment,
        prepaymentType,
        startDate,
        endedDate,
        orderComment,
        uploadImage,
        finalCost,
        paymentMethod,
        signatureImgUrl,
      } = req.body;
      const orderID = await orderService.saveGravelOrderInDB(req.userData, {
        customer: JSON.parse(customer),
        deceased: JSON.parse(deceased),
        addedServiceGravelOrder: JSON.parse(addedServiceGravelOrder),
        additionalServices,
        amount,
        paymentType,
        discount,
        discountType,
        prepayment,
        prepaymentType,
        startDate,
        endedDate,
        orderComment,
        uploadImage,
        finalCost,
        paymentMethod,
        signatureImgUrl,
      });
      return res
        .status(200)
        .json({ message: "Заказ с номером " + orderID + " успешно создан." });
      // console.log(orderData);
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
  getOrderList: async (req, res) => {
    try {
      const orderList = await orderService.getOrderList(req.userData);
      return res
        .status(200)
        .json({ orders: orderList, message: "Список заказов получен" });
    } catch (e) {
      res.status(e.status).json({ errorType: e.errorType, message: e.message });
    }
  },
};
