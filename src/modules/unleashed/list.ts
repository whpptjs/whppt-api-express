import { HttpModule } from '../HttpModule';

import { UnleashedProduct } from './Models/UnleashedProduct';

const list: HttpModule<{}, UnleashedProduct[]> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }) {
    return $database.then(({ queryDocuments }) => {
      return queryDocuments<UnleashedProduct>('unleashed', {
        filter: {},
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
