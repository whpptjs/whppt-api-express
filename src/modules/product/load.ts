import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

export type ProductLoadFilters = {
  collection: string;
  style: string;
  vintage: string;
  sortBy: string;
  search?: string;
};

const load: HttpModule<{ productId: string }, Product> = {
  exec({ $database }, { productId }) {
    return $database.then(({ document, queryDocuments }) => {
      return document.fetch<Product>('products', productId).then(product => {
        if (!product)
          return Promise.reject({
            status: 404,
            error: new Error(`Product Not Found`),
          });
        const connectedVintageIds = product?.customFields?.vintages?.map(
          (v: any) => v.productId
        );
        if (!connectedVintageIds || !connectedVintageIds.length) return product;
        return queryDocuments<any>('pages', {
          filter: {
            productId: { $in: connectedVintageIds },
          },
          projection: {
            slug: 1,
            productId: 1,
          },
        }).then(pages => {
          return {
            ...product,
            customFields: {
              ...product.customFields,
              vintages: product?.customFields?.vintages?.map((v: any) => {
                const foundPage = pages.find(p => p.productId === v.productId);
                return {
                  ...v,
                  slug: foundPage?.slug,
                };
              }),
            },
          };
        });
      });
    });
  },
};

export default load;
