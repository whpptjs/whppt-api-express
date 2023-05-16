import { sumBy } from 'lodash';
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

  const shippingCost = order.payment?.shippingCost?.price
    ? Number(order.payment?.shippingCost?.price)
    : 0;
  const amountOfItems = sumBy(order.items, (i: any) => i.quantity);
  const shippingCostPer = shippingCost / amountOfItems;

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

      return {
        ...item,
        productName: item.productName || item.product?.name,
        totalDiscountApplied,
        revenue: revenue,
        shippingCostPrice: shippingCostPer * item.quantity,
      };
    }),
  };
};
