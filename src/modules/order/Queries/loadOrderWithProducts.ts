import assert from 'assert';
import find from 'lodash/find';
import { ContextType } from 'src/context/Context';
import { Order, OrderWithProducts } from 'src/modules/order/Models/Order';
import { Product } from 'src/modules/product/Models/Product';
import type { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  matchQuery: any
) => Promise<OrderWithProducts>;

export const loadOrderWithProducts: LoadOrderWithProductsArgs = (
  { $database },
  matchQuery
) => {
  return $database.then(database => {
    assert(matchQuery, 'Match Query Required.');
    const { document, queryDocuments } = database as WhpptMongoDatabase;

    return document.query<Order>('orders', { filter: matchQuery }).then(order => {
      if (!order) return Promise.reject({ status: 404, message: 'Order Not Found.' });

      const productIds = order.items.map(i => i.productId);

      return queryDocuments<Product>('products', {
        filter: { _id: { $in: productIds } },
      }).then(products => {
        const _order = {
          ...order,
          items: order.items.map(i => {
            const product = find(products, p => p._id === i.productId);
            return {
              ...i,
              product,
            };
          }),
        };

        return _order as unknown as OrderWithProducts;
      });
    });
  });
};
