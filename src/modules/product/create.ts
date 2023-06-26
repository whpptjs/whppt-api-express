import assert from 'assert';
import { WhpptUser } from '../../Services/Security/User';
import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';
import { Db } from 'mongodb';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

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

    return ($database as Promise<WhpptMongoDatabase>).then(
      ({ pubDb, document, startTransaction }) => {
        assert(pubDb, 'Pub DB is undefined');
        return queryDocument(pubDb, { filter: { name, productCode, domainId } }).then(
          _product => {
            if (_product)
              throw new Error(
                `Product already exists with Code: ${productCode} and Name ${name}. Product that already exists is ${_product?.name}`
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
              return document
                .saveWithEvents('products', product, [event], { session })
                .then(() => {
                  if (process.env.DRAFT !== 'true') return product;

                  return document
                    .publishWithEvents('products', product, [event], {
                      session,
                    })
                    .then(() => {
                      return product;
                    });
                });
            });
          }
        );
      }
    );
  },
};

const queryDocument = (
  pubDb: Db,
  query: {
    filter: { [key: string]: any };
  }
) => {
  return pubDb.collection('products').findOne<Product>(query.filter);
};

export default create;
