import assert from 'assert';
import { omit } from 'lodash';
import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

export type ChangeDetailsArgs = {
  _id: string;
  domainId: string;
  name: string;
  productCode: string;
  description?: string;
  family?: string;
  quantityAvailable?: string;
  canPlaceOrderQuantity?: string;
  unitOfMeasure?: string;
  price?: string;
  isActive: boolean;
  customFields: {
    [key: string]: string | undefined;
  };
};

const changeDetails: HttpModule<ChangeDetailsArgs, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.name, 'Product requires a Name.');
    assert(productData.productCode, 'Product requires a Product Code.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Product>('products', productData._id).then(product => {
          assert(product, 'Product does not exsist');
          const event = createEvent('ProductDetailsChanged', productData);
          Object.assign(product, omit(productData, ['config']));
          return startTransaction(session => {
            return document
              .saveWithEvents('products', product, [event], { session })
              .then(() => {});
          });
        });
      })
      .then(() => {});
  },
};

export default changeDetails;
