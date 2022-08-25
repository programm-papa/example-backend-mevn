const GraveOrder = require("../models/orderGrave");
const UserInfo = require("../models/userInfo");
const gravelSheets = require("../sheets-apis/gravelSheets");
module.exports = {
  saveGravelOrderInDB: async (userData, orderData) => {
    try {
      const regionGraveOrders = await GraveOrder.find({ orderRegion: userData.region });
      //Вычесление номера заказа в зависимости от региона
      let orderNumber = 1;
      if (regionGraveOrders.length != 0) {
        orderNumber = regionGraveOrders.length + 1;
      }
      //Перевод региона в кирилицу
      let orderRegionCyr = "ВН";
      switch (userData.region) {
        case "VN":
          orderRegionCyr = "ВН";
          break;
        case "PS":
          orderRegionCyr = "ПСК";
          break;
        case "TV":
          orderRegionCyr = "ТРЬ";
          break;
        case "VG":
          orderRegionCyr = "ВГДА";
          break;
        case "HP":
          orderRegionCyr = "ЧПЦ";
          break;
        case "SPB":
          orderRegionCyr = "СПБ";
          break;
        default:
          orderRegionCyr = "НЕОПР";
          break;
      }
      let orderID = orderRegionCyr + orderNumber;
      //Создание заказа
      const newOrder = new GraveOrder({
        //Создатель заказа
        userId: userData.id,
        //Номер и регион заказа
        orderID: orderID,
        orderRegion: userData.region,
        //Данные заказчика
        customerName: orderData.customer.customerName,
        customerPhone: orderData.customer.customerPhone,
        customerAddress: orderData.customer.customerAddress,
        customerEmail: orderData.customer.customerEmail,
        //Данные покойного
        deceasedName: orderData.deceased.deceasedName,
        deceasedInstallationAddress:
          orderData.deceased.deceasedInstallationAddress,
        deceasedRegion: orderData.deceased.deceasedRegion,
        deceasedRow: orderData.deceased.deceasedRow,
        deceasedPlace: orderData.deceased.deceasedPlace,
        //Добавленные услуги
        addedServiceGravelOrder: [...orderData.addedServiceGravelOrder],
        //Дополнительные услуги
        additionalServices: orderData.additionalServices,
        //Цена и вариант оплаты
        amount: orderData.amount,
        paymentType: orderData.paymentType,
        //Скидка и вариант скидки
        discount: orderData.discount,
        discountType: orderData.discountType,
        //Аванс и вариант аванса
        prepayment: orderData.prepayment,
        prepaymentType: orderData.prepaymentType,
        //Дедлайн
        startDate: orderData.startDate,
        endedDate: orderData.endedDate,
        //Комментарий заказа
        orderComment: orderData.orderComment,
        //Загруженное изображение
        uploadImage: orderData.uploadImage,
        //Финальная стоимость заказа "К ОПЛАТЕ"
        finalCost: orderData.finalCost,
        //Способ оплаты
        paymentMethod: orderData.paymentMethod,
        //Подтверждение заказа
        orderСonfirmation: orderData.orderСonfirmation,
        //Подпись заказчика
        signatureImgUrl: orderData.signatureImgUrl,
      });

      //
      //Запись заказа в таблицу
      const date = new Date();
      const curentDate = date.getDate() + "." + date.getMonth() + "." + date.getFullYear()
      const creatorOrder = await UserInfo.findOne({ userId: userData.id });
      await gravelSheets.loadInfo(); // loads document properties and worksheets
      const sheet = gravelSheets.sheetsByIndex[0];
      //Деньги полученные при оформлении заказа;
      let dateDepositMoney = "";
      if (newOrder.finalCost != 0) {
        dateDepositMoney = curentDate;
      }
      //Строка с выбранными услугами
      let serviceStr = "";
      for (let servise of newOrder.addedServiceGravelOrder) {
        serviceStr +=
          'Услуга: "' +
          servise.name +
          '";\nРазмер: ' +
          servise.quantity +
          " " +
          servise.measurement +
          ";\nЦена за ед: " +
          servise.priceMeasurement +
          "руб;\nЦена: " + servise.price + "руб;\n\n";
      }
      await sheet.addRow({
        "Дата Заказа": curentDate,
        "№ заказа": newOrder.orderID,
        "фио заказчика/ТЕЛЕФОН":
          newOrder.customerName +
          "\n" +
          newOrder.customerPhone +
          "\n" +
          newOrder.customerAddress +
          "\n" +
          newOrder.customerEmail,
        "Адрес Захоронения,ФИО умершего":
          newOrder.deceasedInstallationAddress + "\n" + newOrder.deceasedName,
        "УЧАСТОК/РЯД/МЕСТО":
          "Участок: " +
          newOrder.deceasedRegion +
          "\n" +
          "Ряд: " +
          newOrder.deceasedRow +
          "\n" +
          "Место: " +
          newOrder.deceasedPlace,
        МАП:
          creatorOrder.fullName +
          "\n" +
          creatorOrder.contactEmail +
          "\n" +
          creatorOrder.phone,
        "Общая сумма заказа": newOrder.amount,
        "производимые работы": serviceStr,
        "Аванс , доплата": newOrder.finalCost,
        "Дата внесения денег": dateDepositMoney,
      });
      const rows = await sheet.getRows();
      //Номер созданной выше строки
      const newRowNumber = rows[rows.length - 1]._rowNumber;
      //Выборка ячеек
      await sheet.loadCells("A" + newRowNumber + ":S" + newRowNumber);
      //Ячейка с общей суммой заказа
      const amount = sheet.getCellByA1("G" + newRowNumber);
      amount.numberFormat = { type: "CURRENCY", pattern: "[$р.-419]#,##0" };
      //Ячейка доплата/аванс
      const prepayment = sheet.getCellByA1("L" + newRowNumber);
      prepayment.numberFormat = { type: "CURRENCY", pattern: "[$р.-419]#,##0" };
      //Ячейка дата внесения доплата/аванс
      const prepaymentDate = sheet.getCellByA1("M" + newRowNumber);
      prepaymentDate.numberFormat = { type: "DATE" };
      //Ячейка с ЦПА+РАСХОДНИК
      const hCells = sheet.getCellByA1("H" + newRowNumber);
      hCells.formula = "=G" + newRowNumber + "*0,125";
      //Цена Бетонных работ
      const iCells = sheet.getCellByA1("I" + newRowNumber);
      iCells.formula =
        "=СУММ(G" +
        newRowNumber +
        "-H" +
        newRowNumber +
        "-J" +
        newRowNumber +
        ")";
      //МАП (20%) бетон
      const nCells = sheet.getCellByA1("N" + newRowNumber);
      nCells.formula = "=ПРОИЗВЕД(0,2;I" + newRowNumber + ")";
      //Оплата установщикам (20%)
      const qCells = sheet.getCellByA1("Q" + newRowNumber);
      qCells.formula = "=ПРОИЗВЕД(0,2;I" + newRowNumber + ")";
      //Сумма долга
      const rCells = sheet.getCellByA1("R" + newRowNumber);
      rCells.formula = "=СУММ(G" + newRowNumber + "-L" + newRowNumber + ")";
      //Выручка
      const sCells = sheet.getCellByA1("S" + newRowNumber);
      sCells.formula =
        "=СУММ(G" +
        newRowNumber +
        "-J" +
        newRowNumber +
        "-N" +
        newRowNumber +
        "-O" +
        newRowNumber +
        "-Q" +
        newRowNumber +
        ")";
      await sheet.saveUpdatedCells();
      newOrder.save();
      return newOrder.orderID;
    } catch (e) {
      console.log(e);
      throw generateError.BadRequest(
        401,
        "createGraveOrder",
        "Не удалось создать заказ на благоустройство могилы."
      );
    }
  },
  getOrderList: async (userData) => {
    if (
      userData.roles.includes("MANAGER") ||
      userData.roles.includes("ADMIN")
    ) {
      const graveOrder = await GraveOrder.find({});
      const userGraveOrder = await GraveOrder.find({ userId: userData.id });
      return {graveOrder, userGraveOrder};
    } else {
      const userGraveOrder = await GraveOrder.find({ userId: userData.id });
      return {userGraveOrder};
    }
  },
};
