import { HttpModule } from '../HttpModule';

import { UnleashedProduct } from './Models/UnleashedProduct';

const list: HttpModule<{ productGroup: string }, UnleashedProduct[]> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { productGroup }) {
    return $database.then(({ queryDocuments }) => {
      const query = productGroup ? { 'ProductGroup.GroupName': productGroup } : {};
      return queryDocuments<UnleashedProduct>('unleashed', {
        filter: query,
        projection: {
          _id: 1,
          IsSellable: 1,
          ProductCode: 1,
          ProductDescription: 1,
          ProductGroup: 1,
          UnitOfMeasure: 1,
        },
      });
    });
  },
};
export default list;
