import { Order } from '../Models/Order';

export const addUnitDiscountsToOrder = (order: Order) => {
  const memberDiscount = order?.payment?.memberTotalDiscount
    ? Number(order?.payment?.memberTotalDiscount)
    : undefined;

  const totalPrice = Number(order?.payment?.subTotal);

  return {
    ...order,
    items: order.items.map(item => {
      const purchasedPrice = Number(item.purchasedPrice);
      const ratio = totalPrice ? purchasedPrice / totalPrice : purchasedPrice;

      const multiplyRatio = memberDiscount && ratio ? memberDiscount * ratio : false;

      const unitPriceWithDiscount = multiplyRatio
        ? purchasedPrice - multiplyRatio
        : purchasedPrice;

      return {
        ...item,
        unitPriceWithDiscount,
        discountApplied: unitPriceWithDiscount
          ? ((purchasedPrice - unitPriceWithDiscount) / purchasedPrice) * 100
          : 0,
      };
    }),
  };
};
