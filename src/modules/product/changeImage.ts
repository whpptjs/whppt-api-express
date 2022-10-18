import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { replaceInList } from '../../replaceInList';
import { Product, WhpptProductImageData } from './Models/Product';

export type ChangeProductImageArgs = {
  domainId: string;
  productId: string;
  featureImageId?: string;
  image: WhpptProductImageData;
};

const changeImage: HttpModule<ChangeProductImageArgs, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, { domainId, productId, image, featureImageId }) {
    assert(domainId, 'Domain Id required.');
    assert(productId, 'Product Id required.');

    assert(image._id, 'Image required.');
    assert(image.desktop.galleryItemId, 'Product requires at minimum a Desktop image.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');
        assert(product.images, 'Could not find image to save on product');

        const events = [
          createEvent('ProductImageDetailsChanged', { _id: productId, image }),
        ];

        if (featureImageId && product.featureImageId !== featureImageId) {
          events.push(
            createEvent('ProductFeatureImageChanged', { _id: productId, featureImageId })
          );
          Object.assign(product, { featureImageId });
        }

        Object.assign(product, { images: replaceInList(product.images, image) });

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => {});
      });
    });
  },
};

export default changeImage;
