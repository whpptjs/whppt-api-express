import assert from 'assert';
import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

const publish: HttpModule<{ productId: string }, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $salesForce, $database, createEvent }, { productId }) {
    assert(productId, 'Product Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Product>('products', productId).then(product => {
          assert(product, 'Product does not exsist');
          const event = createEvent('ProductPublished', product);

          return startTransaction(session => {
            return Promise.all([
              document.saveWithEvents('products', product, [event], { session }),
              document.publish('products', product, { session }),
            ]).then(() => {
              // TODO Consider moving this to an event.
              return $salesForce.$Oauth().then((token: string) => {
                return $salesForce.$upsert(token, product._id, salesForceItem(product));
              });
            });
          });
        });
      })
      .then(() => {});
  },
};

const salesForceItem = (item: Product) => {
  return {
    Name: item.name,
    ProductCode: item.productCode,
    Description: item.description,
    Family: item.family,
    StockKeepingUnit: item.customFields.stockKeepingUnit,
    QuantityUnitOfMeasure: item.customFields.quantityUnitOfMeasure,
    Varietal__c: item.customFields.varietal,
    Vintage__c: item.customFields.vintage,
    Bottle_Size__c: item.customFields.bottleSize,
    IsActive: item.isActive,
  };
};

export default publish;
