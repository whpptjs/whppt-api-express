import { OrderItemWithProduct } from 'src/modules/order/Models/Order';

function getSubtotal(order: any) {
  return order && order.items.length
    ? order.items.reduce(
        (acc: number, item: OrderItemWithProduct) =>
          acc +
          (Number(item?.purchasedPrice || item.product?.price || 0) / 100) *
            Number(item.quantity),
        0
      )
    : 0;
}

export const buildOrderForDisplay = (order: any) => {
  const memberShippingDiscount =
    Number(order?.payment?.memberShippingDiscount) / 100 || 0;
  const membersDiscount = Number(order?.payment?.memberTotalDiscount) / 100 || 0;
  const totalDiscounted = order?.overrides?.total && order?.overrides?.total / 100;

  const _shippingCost =
    Number(
      order?.payment?.shippingCost?.price || order?.shipping?.shippingCost?.price || 0
    ) /
      100 -
    memberShippingDiscount;

  const shippingCost = _shippingCost >= 0 ? _shippingCost : 0;

  const shipping = order?.shipping?.pickup
    ? 'Pickup'
    : shippingCost === 0
    ? 'Complimentary'
    : `$${shippingCost.toFixed(2)}`;
  const subtotal = getSubtotal(order);
  //   const subTotalAfterShippingAndDiscounts =
  //     subtotal + shipping - Number(memberShippingDiscount) - Number(memberTotalDiscount);

  const itemsDiscountedCostInCents =
    order && order.items.length
      ? order.items.reduce((acc: number, item: OrderItemWithProduct) => {
          const price = Number(
            item.overidedPrice || item.overidedPrice === 0
              ? item.overidedPrice
              : undefined
          );
          if (!price) return acc;
          return (
            acc + ((Number(item.originalPrice) || 0) - price) * Number(item.quantity)
          );
        }, 0)
      : 0;
  const itemsDiscountedAmount = itemsDiscountedCostInCents / 100;
  const totalDiscountedFromTotal =
    (totalDiscounted || totalDiscounted === 0) && subtotal
      ? subtotal + shippingCost - totalDiscounted
      : 0;

  const total =
    totalDiscounted || totalDiscounted === 0
      ? totalDiscounted
      : subtotal + shippingCost - membersDiscount;
  const tax = total / 11;

  return {
    total: total.toFixed(2),
    subtotal: subtotal.toFixed(2),
    shipping,
    totalDiscountedFromTotal:
      totalDiscountedFromTotal > 0 ? totalDiscountedFromTotal.toFixed(2) : 0,
    itemsDiscountedAmount:
      itemsDiscountedAmount > 0 ? itemsDiscountedAmount.toFixed(2) : 0,
    tax: tax.toFixed(2),
    membersDiscount: membersDiscount > 0 ? membersDiscount.toFixed(2) : 0,
  };
};
