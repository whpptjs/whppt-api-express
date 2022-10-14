import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

export type SaveConfigParams = {
  key: string;
  value: any;
  productId: string;
};

export const saveConfig: HttpModule<SaveConfigParams, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, setEvent }, { productId, key, value }) {
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        const events = [] as any[];
        product.config
          ? (product.config[key] = value)
          : (product.config = { [key]: value });
        events.push(setEvent('ProductConfigSaved', { _id: productId, key, value }));
        return startTransaction(session => {
          return document
            .saveWithEvents('products', product, events, { session })
            .then(() => {});
        });
      });
    });
  },
};

export default saveConfig;
