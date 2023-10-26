import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

export type ProductLoadFilters = {
  collection: string;
  style: string;
  vintage: string;
  sortBy: string;
  search?: string;
};

const load: HttpModule<{ productIds: string; activeOnly?: boolean }, Product[]> = {
  exec({ $database }, { productIds, activeOnly = false }) {
    return $database.then(({ queryDocuments }) => {
      const _query = {
        _id: { $in: JSON.parse(productIds) },
      } as any;
      if (activeOnly) {
        _query.isActive = true;
        _query.forSaleOnWebsite = true;
        _query.quantityAvailable = { $ne: '0' };
      }
      return queryDocuments<any>('products', {
        filter: _query,
        projection: {
          config: 0,
          user: 0,
        },
      });
    });
  },
};

export default load;
