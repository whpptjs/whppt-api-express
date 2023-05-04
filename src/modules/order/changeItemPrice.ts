import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { OrderItemWithProduct } from './Models/Order';
import * as validations from './Validations';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { Secure } from '../staff/Secure';

const changeItemPrice: HttpModule<
  { orderItemId: string; overidedPrice: number; orderId?: string | undefined },
  void
> = {
  exec(context, { orderItemId, overidedPrice, orderId }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(orderItemId, 'Order Item Id is required.');
    console.log(
      '🚀 ~ file: changeItemPrice.ts:20 ~ exec ~ overidedPrice:',
      overidedPrice
    );
    assert(overidedPrice || overidedPrice === 0, 'Product Override price is required.');
    const overidedPriceAsNumber = Number(overidedPrice);
    assert(overidedPriceAsNumber >= 0, 'Product Price must be 0 or higher.');

    return $database
      .then(({ document, startTransaction }) => {
        return loadOrderWithProducts(context, { _id: orderId }).then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          validations.canBeModified(loadedOrder);
          validations.itemExists(loadedOrder, orderItemId);

          const productItem = loadedOrder.items.find(
            i => i._id === orderItemId
          ) as OrderItemWithProduct;

          assert(productItem, 'Order Item not found on Order');

          const events = [] as any[];

          if (Number(productItem?.product?.price) === overidedPrice) {
            if (productItem.overidedPrice === undefined) return;
            events.push(
              createEvent('OrderItemCanceledOveridedPrice', {
                _id: loadedOrder._id,
                productOrderId: productItem._id,
                productId: productItem.productId,
                overidedPrice,
                previousQuantity: productItem.overidedPrice,
              })
            );
            productItem.overidedPrice = undefined;
          } else {
            if (productItem.overidedPrice === overidedPrice) return;
            events.push(
              createEvent('OrderItemOveridedPrice', {
                _id: loadedOrder._id,
                productOrderId: productItem._id,
                productId: productItem.productId,
                overidedPrice,
                previousQuantity: productItem.overidedPrice,
              })
            );
            productItem.overidedPrice = overidedPrice;
          }

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, events, {
              session,
            });
          });
        });
      })
      .then(() => {});
  },
};

export default Secure(changeItemPrice);
