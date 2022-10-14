import { HttpModule } from '../HttpModule';

import { Product } from './Models/Product';

const list: HttpModule<
  { domainId: string; limit: string; currentPage: string; search: string },
  { products: Product[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { domainId, limit, currentPage, search }) {
    let query = {
      domainId,
    } as any;
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
