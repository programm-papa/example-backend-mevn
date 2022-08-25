const mongoose = require("mongoose");

const orderGrave = mongoose.Schema(
  {
    //Создатель заказа
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    //Номер заказа
    orderID: { type: String, default: "", require: true, unique: true },
    orderRegion: { type: String, default: "", require: true },
    //Данные о заказчике
    customerName: { type: String, default: "", require: true },
    customerEmail: { type: String, default: "", require: true },
    customerPhone: { type: String, default: "", require: true },
    customerAddress: { type: String, default: "", require: true },
    //Данные о покойном
    deceasedName: { type: String, default: "", require: true },
    deceasedInstallationAddress: { type: String, default: "", require: true },
    deceasedRegion: { type: String, default: "", require: true },
    deceasedRow: { type: String, default: "", require: true },
    deceasedPlace: { type: String, default: "", require: true },
    //Выбранный набор услуг
    addedServiceGravelOrder: [
      {
        name: { type: String, default: "", require: true },
        gravelServiceListId: { type: String, default: "", require: true },
        measurement: { type: String, default: "", require: true },
        priceMeasurement: { type: String, default: "", require: true },
        price: { type: String, default: "", require: true },
        quantity: { type: String, default: "", require: true },
        description: { type: String, default: "", require: true },
      },
    ],
    //Дополнительные услуги
    additionalServices: { type: String, default: "" },
    //Цена и вариант оплаты
    amount: { type: String, default: "", require: true },
    paymentType: { type: String, default: "", require: true },
    //Скидка и вариант скидки
    discount: { type: String, default: "", require: true },
    discountType: { type: String, default: "", require: true },
    //Аванс и вариант аванса
    prepayment: { type: String, default: "", require: true },
    prepaymentType: { type: String, default: "", require: true },
    //Дедлайн
    startDate: { type: String, default: "", require: true },
    endedDate: { type: String, default: "", require: true },
    //Комментарий заказа
    orderComment: { type: String, default: "", require: true },
    //Загруженное изображение
    uploadImage: { type: String, default: "", require: true },
    //Финальная стоимость заказа "К ОПЛАТЕ"
    finalCost: { type: String, default: "", require: true },
    //Способ оплаты
    paymentMethod: { type: String, default: "", require: true },
    //Подтверждение заказа
    orderСonfirmation: { type: String, default: "", require: true },
    //Подпись заказчика
    signatureImgUrl: { type: String, default: "", require: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderGrave", orderGrave);
