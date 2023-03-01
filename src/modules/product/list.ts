import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

const list: HttpModule<
  {
    domainId: string;
    limit: string;
    currentPage: string;
    search: string;
    statusFilter: string;
    sellableFilter: string;
    family: string;
  },
  { products: Product[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec(
    { $database },
    { domainId, limit, currentPage, search, family, statusFilter, sellableFilter }
  ) {
    let query = {
      domainId,
    } as any;

    if (statusFilter) query.isActive = statusFilter === 'active' ? true : false;
    if (sellableFilter === 'pos') query.forSaleOnPos = true;
    if (sellableFilter === 'website') query.forSaleOnWebsite = true;
    if (family) query.family = family;
    if (search) query.name = { $regex: search, $options: 'i' };

    return $database.then(({ queryDocuments, countDocuments }) => {
      return Promise.all([
        queryDocuments<Product>('products', {
          filter: query,
          limit: parseInt(limit),
          skip: parseInt(limit) * parseInt(currentPage),
        }),
        countDocuments('products', { filter: query }),
      ]).then(([products, total]) => {
        return { products, total };
      });
    });
  },
};
export default list;
