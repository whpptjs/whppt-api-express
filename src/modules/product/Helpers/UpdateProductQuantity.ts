import { OrderItem } from 'src/modules/order/Models/Order';
import assert from 'assert';
import { ContextType } from 'src/context/Context';

export const updateProductQuantity = (context: ContextType, item: OrderItem) => {
  assert(item.productId, 'Product needs to have an ID');
  return context.$database.then(({ document, startTransaction }) => {
    return document.fetch('products', item.productId || '').then(product => {
      assert(product._id, 'Product not found');

      const quantity = Number(item.quantity);
      const quantityAvailable = Number(product.quantityAvailable);

      const updatedQuantity = quantityAvailable - quantity;
      product.quantityAvailable = `${updatedQuantity}`;

      const events = [context.createEvent('ProductQuantityAdjusted', product)];

      return startTransaction((session: any) => {
        return document.saveWithEvents('products', product, events, {
          session,
        });
      });
    });
  });
};
