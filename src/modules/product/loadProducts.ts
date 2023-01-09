import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

export type ProductLoadFilters = {
  collection: string;
  style: string;
  vintage: string;
  sortBy: string;
  search?: string;
};

const load: HttpModule<{ productIds: string }, Product[]> = {
  exec({ $database }, { productIds }) {
    return $database.then(({ queryDocuments }) => {
      return queryDocuments<any>('products', {
        filter: {
          _id: { $in: JSON.parse(productIds) },
        },
        projection: {
          config: 0,
          user: 0,
        },
      });
    });
  },
};

export default load;
