import { OrderItemWithProduct, OrderWithProducts } from '../Models/Order';

export const addUnitDiscountsToOrder = (order: OrderWithProducts) => {
  const memberDiscount = order?.payment?.memberTotalDiscount
    ? Number(order?.payment?.memberTotalDiscount)
    : undefined;

  const totalPrice = Number(order?.payment?.subTotal);

  return {
    ...order,
    items: order.items.map((item: OrderItemWithProduct) => {
      const purchasedPrice = Number(item.purchasedPrice);
      const ratio = totalPrice ? purchasedPrice / totalPrice : purchasedPrice;

      const multiplyRatio = memberDiscount && ratio ? memberDiscount * ratio : false;

      const unitPriceWithDiscount = multiplyRatio
        ? purchasedPrice - multiplyRatio
        : purchasedPrice;

      const orgPrice = Number(item.originalPrice || item.product?.price || 0);
      const remainder = orgPrice - Number(item.overidedPrice || 0);
      const remainderWithOriginal = remainder / orgPrice;
      const manualAdjustedDiscount = (remainderWithOriginal * 100).toFixed(2);

      return {
        ...item,
        unitPriceWithDiscount,
        discountApplied: unitPriceWithDiscount
          ? ((purchasedPrice - unitPriceWithDiscount) / purchasedPrice) * 100
          : 0,
        manualAdjustedDiscount: item.overidedPrice ? manualAdjustedDiscount : 0,
      };
    }),
  };
};
