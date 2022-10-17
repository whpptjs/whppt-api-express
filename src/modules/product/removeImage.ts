import assert from 'assert';
import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

export type RemoveImageArgs = {
  domainId: string;
  productId: string;
  imageId: string;
};

const removeImage: HttpModule<RemoveImageArgs, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, setEvent }, { domainId, productId, imageId }) {
    assert(domainId, 'Domain Id required.');
    assert(productId, 'Product Id required.');

    assert(imageId, 'Image Id is required.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');

        const events = [setEvent('ProductImageRemoved', { _id: productId, imageId })];
        Object.assign(product, {
          images: product.images.filter(_image => _image._id !== imageId),
        });

        const nextFeatureImage = product.images[0];
        if (product.featureImageId === imageId && nextFeatureImage) {
          events.push(
            setEvent('ProductFeatureImageChanged', {
              _id: productId,
              featureImageId: nextFeatureImage._id,
            })
          );
          Object.assign(product, {
            domainId,
            productId,
            featureImageId: nextFeatureImage._id,
          });
        }

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => {});
      });
    });
  },
};

export default removeImage;
