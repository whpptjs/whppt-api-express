import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

const list: HttpModule<
  {
    domainId: string;
    limit: string;
    currentPage: string;
    search: string;
    showInactiveItems: string;
    family: string;
  },
  { products: Product[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec(
    { $database },
    { domainId, limit, currentPage, search, family, showInactiveItems }
  ) {
    let query = {
      domainId,
    } as any;

    if (showInactiveItems !== 'true') query.isActive = true;
    if (family) query.family = family;
    console.log('🚀 ~ file: list.ts ~ line 29 ~ family', family);

    if (search) {
      query = {
        $and: [
          { domainId },
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { productCode: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      };
      if (!showInactiveItems) query.$and.push({ isActive: true });
      if (!family) query.$and.push({ family });
    }
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
