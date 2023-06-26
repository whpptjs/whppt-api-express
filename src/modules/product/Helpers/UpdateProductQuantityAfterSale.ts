import { OrderItem } from 'src/modules/order/Models/Order';
import assert from 'assert';
import { Product } from '../Models/Product';
import { ContextType } from '../../../context/Context';

export const updateProductQuantityAfterSale = (
  context: ContextType,
  items: OrderItem[]
) => {
  return context.$database.then(({ document, queryDocuments, startTransaction }) => {
    const _productIds = items.map(i => i.productId);
    return queryDocuments<Product>('products', {
      filter: { _id: { $in: _productIds } },
    }).then(products => {
      return startTransaction((session: any) => {
        const _updatePromises = items.reduce((prev, orderItem) => {
          return prev.then(() =>
            saveDocs(context, orderItem, products, { document, session })
          );
        }, Promise.resolve());
        return _updatePromises;
      });
    });
  });
};

type SaveDocs = (
  context: ContextType,
  item: OrderItem,
  products: Product[],
  session: any
) => Promise<void>;

const saveDocs: SaveDocs = (context, item, products, { document, session }) => {
  assert(item.productId, 'Product needs to have an ID');
  const product = products.find((p: Product) => p._id === item.productId);
  assert(product?._id, 'Product not found');

  const quantity = Number(item.quantity);
  const quantityAvailable = Number(product.quantityAvailable);

  const updatedQuantity = quantityAvailable - quantity;
  product.quantityAvailable = `${updatedQuantity}`;
  const events = [context.createEvent('ProductQuantityDecreasedAfterSale', product)];
  return document
    .saveWithEvents('products', product, events, {
      session,
    })
    .then(() => {
      if (process.env.DRAFT !== 'true') return;
      return document.publishWithEvents('products', product, events, {
        session,
      });
    });
};
