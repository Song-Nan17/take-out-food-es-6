let bestCharge = selectedItems => {
  const sameItemTotalPrice = computeSameItemTotalPrice(selectedItems);
  const totalPriceWithNoPromotion = computeTotalPriceWithNoPromotion(sameItemTotalPrice);
  const promotion = choosePromotion(sameItemTotalPrice, totalPriceWithNoPromotion);
  const totalPrice = computeTotalPrice(totalPriceWithNoPromotion, promotion);
  return printOrderList(sameItemTotalPrice, promotion, totalPrice);
}

let computeSameItemTotalPrice = selectedItems => {
  const selectedIdAndQuantity = getItemIdAndQuantity(selectedItems);
  let sameItemTotalPrice = selectedIdAndQuantity.map(selectedEle => {
    let selectedEleInfo = loadAllItems().find(ele => ele.id === selectedEle.id);
    selectedEle.name = selectedEleInfo.name;
    selectedEle.totalPrice = selectedEle.quantity * selectedEleInfo.price;
    return selectedEle;
  });
  return sameItemTotalPrice;
}

let getItemIdAndQuantity = selectedItems => selectedItems.map(ele => {
  let arr = ele.split(' x ');
  let obj = {};
  obj.id = arr[0];
  obj.quantity = Number(arr[1]);
  return obj;
});

let computeTotalPriceWithNoPromotion = sameItemTotalPrice => sameItemTotalPrice.reduce((totalPrice, item) => totalPrice + item.totalPrice, 0);


let choosePromotion = (sameItemTotalPrice, totalPriceWithNoPromotion) => {
  const promotions = loadPromotions();
  const moneyOff = computeMoneyOff(totalPriceWithNoPromotion, promotions);
  const halfOff = computeHalfOff(sameItemTotalPrice, promotions);
  return comparePromotions(moneyOff, halfOff);
}

let computeMoneyOff = (totalPrice, promotions) => {
  let moneyOff = {};
  moneyOff.type = promotions[0].type;
  moneyOff.reduceMoney = 0;
  if (totalPrice >= 30) {
    moneyOff.reduceMoney = 6;
  }
  return moneyOff;
}

let computeHalfOff = (sameItemTotalPrice, promotions) => {
  let items = [];
  let reduceMoney = 0;
  let halfOff = sameItemTotalPrice.reduce((acc, item) => {
    acc.type = promotions[1].type;
    if (promotions[1].items.includes(item.id)) {
      items.push(item.name);
      reduceMoney += item.totalPrice / 2;
    }
    acc.items = items;
    acc.reduceMoney = reduceMoney;
    return acc;
  }, {});
  return halfOff;
}

let comparePromotions = (moneyOff, halfOff) => {
  if (moneyOff.reduceMoney < halfOff.reduceMoney) {
    return halfOff;
  }
  return moneyOff;
}

let computeTotalPrice = (price, promotion) => price - promotion.reduceMoney;

let printOrderList = (sameItemTotalPrice, promotion, totalPrice) => {
  const itemsList = printItemsList(sameItemTotalPrice);
  const promotionList = printPromotionList(promotion);
  const totalPriceList = printTotalPriceList(totalPrice);
  return itemsList + promotionList + totalPriceList;
}

function printItemsList(sameItemTotalPrice) {
  let itemsList = sameItemTotalPrice.reduce((acc, item) => acc + `${item.name} x ${item.quantity} = ${item.totalPrice}元
`
    , '');
  return `
============= 订餐明细 =============
${itemsList}`;
}


let printPromotionList = promotion => {
  if (promotion.reduceMoney === 0) {
    return `-----------------------------------
`;
  } else if (promotion.type === '满30减6元') {
    return `-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------
`;
  } else if (promotion.type === '指定菜品半价') {
    return `-----------------------------------
使用优惠:
指定菜品半价(${promotion.items.join('，')})，省${promotion.reduceMoney}元
-----------------------------------
`;
  }
}

let printTotalPriceList = totalPrice => `总计：${totalPrice}元
===================================`;
