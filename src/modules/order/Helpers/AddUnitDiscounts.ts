import { OrderItemWithProduct, OrderWithProducts } from '../Models/Order';

export const addUnitDiscountsToOrder = (order: OrderWithProducts) => {
  const orderLevelDiscountPercentage =
    order.payment?.overrideTotalPrice && order.payment.originalSubTotal
      ? order.payment?.overrideTotalPrice / order.payment.originalSubTotal
      : 0;

  return {
    ...order,
    items: order.items.map((item: OrderItemWithProduct) => {
      const purchasedPrice = Number(item.purchasedPrice);
      const unitPriceWithDiscount = purchasedPrice * orderLevelDiscountPercentage;

      const orgPrice = Number(item.originalPrice || item.product?.price || 0);

      const percentagePaidOnLineItem = unitPriceWithDiscount / orgPrice;
      const totalDiscountOnLineItem = 1 - percentagePaidOnLineItem;

      const remainder = orgPrice - Number(item.overidedPrice || 0);

      const remainderWithOriginal = remainder / orgPrice;
      const manualAdjustedDiscount = (remainderWithOriginal * 100).toFixed(2);

      return {
        ...item,
        unitPriceWithDiscount: unitPriceWithDiscount.toFixed(2),
        discountApplied: totalDiscountOnLineItem ? totalDiscountOnLineItem * 100 : 0,
        manualAdjustedDiscount: item.overidedPrice ? manualAdjustedDiscount : 0,
      };
    }),
  };
};
