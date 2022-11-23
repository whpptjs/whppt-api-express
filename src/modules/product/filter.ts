import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

export type ProductListFilters = {
  collection: string;
  style: string;
  vintage: string;
  sortBy: string;
  search?: string;
};

const filter: HttpModule<
  { domainId: string; limit: string; currentPage: string; filters: ProductListFilters },
  { products: Product[]; total: number }
> = {
  exec({ $database }, { domainId, limit, currentPage, filters = {} }) {
    let query = {
      domainId,
      isActive: true,
    } as any;

    if (filters.vintage && filters.vintage !== 'all') {
      query = {
        ...query,
        $and: query.$and
          ? (query.$and = [...query.$and, { 'customFields.vintage': filters.vintage }])
          : (query.$and = [{ 'customFields.vintage': filters.vintage }]),
      };
    }
    if (filters.collection && filters.collection !== 'all') {
      query = {
        ...query,
        $and: query.$and
          ? (query.$and = [...query.$and, { family: filters.collection }])
          : (query.$and = [{ family: filters.collection }]),
      };
    }
    if (filters.style && filters.style !== 'all') {
      query = {
        ...query,
        $and: query.$and
          ? (query.$and = [...query.$and, { style: filters.style }])
          : (query.$and = [{ style: filters.style }]),
      };
    }
    if (filters.search) {
      query = {
        ...query,
        $and: query.$and
          ? (query.$and = [
              ...query.$and,
              { name: { $regex: filters.search, $options: 'i' } },
            ])
          : (query.$and = [{ name: { $regex: filters.search, $options: 'i' } }]),
      };
    }

    const sortFilter = sortLookup(filters.sortBy || 'recommended');

    return $database.then(({ queryDocuments, countDocuments }) => {
      return Promise.all([
        queryDocuments<Product>('products', {
          filter: query,
          sort: sortFilter,
          skip: parseInt(limit) * parseInt(currentPage),
          limit: parseInt(limit),
        }),
        countDocuments('products', { filter: query }),
      ]).then(([products, total = 0]) => {
        return { products, total };
      });
    });
  },
};

export default filter;

function sortLookup(key: string) {
  switch (key) {
    case 'name (a-z)':
      return {
        name: 1,
      };
    case 'name (z-a)':
      return {
        name: -1,
      };
    case 'price (lowest to highest)':
      return {
        price: -1,
      };
    case 'price (highest to lowest)':
      return {
        price: 1,
      };
    default:
      return { name: 1 };
  }
}
