import assert from 'assert';
import { WhpptUser } from '../../Services/Security/User';
import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

export type CreateProductArgs = {
  domainId: string;
  name: string;
  productCode: string;
  user: WhpptUser;
};

const create: HttpModule<CreateProductArgs, Product> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, $id, createEvent }, { domainId, name, productCode, user }) {
    assert(domainId, 'Product requires a Domain Id.');
    assert(name, 'Product requires a Name.');
    assert(productCode, 'Product requires a Product Code.');
    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Product>('products', { filter: { name, productCode, domainId } })
        .then(_product => {
          assert(
            !_product,
            `Product already exsits with Code: ${productCode} and Name ${name}`
          );

          const product = Object.assign(
            {},
            {
              _id: $id.newId(),
              domainId,
              name,
              productCode,
              isActive: false,
              config: {},
              customFields: {},
              images: [],
            }
          );
          const event = createEvent('CreateProduct', {
            product,
            user: { _id: user._id, username: user.username },
          });

          return startTransaction(session => {
            return document.saveWithEvents('products', product, [event], { session });
          }).then(() => product);
        });
    });
  },
};

export default create;
