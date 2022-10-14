import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { WhpptImageData } from '../image/Models';
import { Product, WhpptProductImageData } from './Models/Product';

export type AddProductImageArgs = {
  domainId: string;
  productId: string;
  featureImageId?: string;
  image: WhpptImageData;
};

const addImage: HttpModule<AddProductImageArgs, WhpptProductImageData> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent, $id }, { domainId, productId, image, featureImageId }) {
    assert(domainId, 'Product requires a Domain Id.');
    assert(productId, 'Product requires a Product Id.');

    assert(image.desktop.galleryItemId, 'Product requires at minimum a Desktop image.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');
        const newImage = {
          ...image,
          _id: $id.newId(),
        } as WhpptProductImageData;
        const events = [
          createEvent('ProductImageAdded', { _id: productId, image: newImage }),
        ];
        Object.assign(product, {
          images: product.images ? [...product.images, newImage] : [newImage],
        });

        if (!product.featureImageId) {
          events.push(
            createEvent('ProductFeatureImageChanged', {
              _id: productId,
              featureImageId: newImage._id,
            })
          );
          Object.assign(product, { featureImageId: newImage._id });
        } else if (featureImageId && product.featureImageId !== featureImageId) {
          events.push(
            createEvent('ProductFeatureImageChanged', { _id: productId, featureImageId })
          );
          Object.assign(product, { featureImageId });
        }

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => newImage);
      });
    });
  },
};

export default addImage;
