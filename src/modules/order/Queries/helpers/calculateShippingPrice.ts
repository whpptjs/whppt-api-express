import { OrderItemWithProduct } from '../../Models/Order';

type CalculateShippingPrice = (
  items: OrderItemWithProduct[],
  price?: number | string
) => number | string | undefined;

type PackItem = {
  _id: string;
  name: string;
  productCode: string;
  qty: number;
  freeDelivery?: boolean;
};

const BOX_QTY = 12;

export const calculateShippingPrice: CalculateShippingPrice = (items, price) => {
  let bottles = 0;
  items.forEach((item: OrderItemWithProduct) => {
    if (item.product?.freeDelivery) return;

    if (item.product?.customFields.quantityUnitOfMeasure === 'pack') {
      const itemsInPacks = item.product?.customFields?.packItems || [];
      bottles +=
        item.quantity *
          itemsInPacks.reduce((acc: number, item: PackItem) => {
            acc += item.qty;
            return acc;
          }, 0) +
        item.quantity;
    }
    bottles += item.quantity * item.product?.customFields?.qtyOfItemsInProduct || 1;
  });

  return calculateBoxes(bottles) * Number(price);
};

const calculateBoxes = (bottles: number) => {
  return Math.ceil(bottles / BOX_QTY);
};
