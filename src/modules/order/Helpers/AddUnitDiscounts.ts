import {
  OrderItemWithProduct,
  OrderWithProducts,
  OrderWithProductsAndDiscounts,
} from '../Models/Order';

export type AddUnitDiscountsToOrder = (
  order: OrderWithProducts
) => OrderWithProductsAndDiscounts;

export const addUnitDiscountsToOrder: AddUnitDiscountsToOrder = order => {
  const orderLevelDiscountPercentage =
    order.payment?.originalSubTotal && order.payment?.overrideTotalPrice
      ? order.payment?.overrideTotalPrice / order.payment.originalSubTotal
      : 0;
  const memberLevelDiscountPercentage =
    order.payment?.originalSubTotal && order.payment?.memberTotalDiscount
      ? order.payment?.memberTotalDiscount / order.payment.originalSubTotal
      : 0;

  return {
    ...order,
    items: order.items.map((item: OrderItemWithProduct) => {
      const purchasedPrice = Number(item.purchasedPrice);

      const unitPriceWithDiscount = orderLevelDiscountPercentage
        ? purchasedPrice * orderLevelDiscountPercentage
        : purchasedPrice;
      const unitPriceWithMemberDiscount = memberLevelDiscountPercentage
        ? purchasedPrice - purchasedPrice * memberLevelDiscountPercentage
        : 0;

      const orgPrice = Number(item.originalPrice || item.product?.price || 0);

      const percentagePaidOnLineItem = unitPriceWithDiscount / orgPrice;
      const totalDiscountOnLineItem = 1 - percentagePaidOnLineItem;
      const totalDiscountApplied = totalDiscountOnLineItem
        ? totalDiscountOnLineItem * 100
        : memberLevelDiscountPercentage
        ? memberLevelDiscountPercentage * 100
        : 0;

      const revenue = unitPriceWithMemberDiscount
        ? unitPriceWithMemberDiscount * item.quantity
        : unitPriceWithDiscount * item.quantity;

      // const remainder = orgPrice - Number(item.overidedPrice || 0);

      // const remainderWithOriginal = remainder / orgPrice;
      // const manualAdjustedDiscount = (remainderWithOriginal * 100).toFixed(2);

      return {
        ...item,
        // unitPriceWithDiscount: unitPriceWithDiscount.toFixed(2),
        // discountApplied: totalDiscountOnLineItem ? totalDiscountOnLineItem * 100 : 0,
        // manualAdjustedDiscount: item.overidedPrice ? manualAdjustedDiscount : 0,

        totalDiscountApplied,
        revenue: revenue,
      };
    }),
  };
};
