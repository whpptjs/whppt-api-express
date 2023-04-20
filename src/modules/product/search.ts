import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

const search: HttpModule<
  {
    domainId: string;
    search: string;
  },
  { products: Product[] }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { domainId, search }) {
    const query = {
      domainId,
      isActive: true,
    } as any;

    const projection = {
      _id: 1,
      name: 1,
    };

    if (search)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
      ];

    return $database.then(({ queryDocuments }) => {
      return queryDocuments<Product>('products', {
        filter: query,
        projection,
      }).then(products => {
        return { products };
      });
    });
  },
};
export default search;
