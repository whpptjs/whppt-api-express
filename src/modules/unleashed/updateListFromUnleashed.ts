import { DatabaseDocument } from '../../Services';
import { HttpModule } from '../HttpModule';

import { UnleashedProduct } from './Models/UnleashedProduct';

const { flatMap } = require('lodash');

export type UnleashedConfig = DatabaseDocument & {};

const updateListFromUnleashed: HttpModule<{}, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $id, $unleashed, $logger, $database }) {
    $logger.info(`Getting products from unleashed`);
    return $database
      .then(({ document, startTransaction }) => {
        return $unleashed
          .$get('Products?pageSize=50', 'pageSize=50')
          .then((results: { Items: UnleashedProduct[]; Pagination: any }) => {
            const getProductsPromises = [];

            // For single use testing.
            // getProductsPromises.push($unleashed.$get(`Products/Page/${1}?pageSize=50`, 'pageSize=50'));

            // For Live use.
            for (let i = 0; i < results.Pagination.NumberOfPages; i++) {
              getProductsPromises.push(
                $unleashed.$get(`Products/Page/${i + 1}?pageSize=50`, 'pageSize=50')
              );
            }

            return Promise.all(getProductsPromises).then(allResults => {
              const allProducts = flatMap(
                allResults,
                (item: { Items: UnleashedProduct[] }) => item.Items
              );
              $logger.info(`${allProducts.length} Products from unleashed`);
              return startTransaction(async (session: any) => {
                const _promises = allProducts.map((r: UnleashedProduct) => {
                  const config: UnleashedConfig = {
                    ...r,
                    _id: r._id || r.Guid || $id.newId(),
                  };
                  return Promise.all([
                    document.save('unleashed', config, { session }),
                    document.publish('unleashed', config, { session }),
                  ]);
                });
                return Promise.all(_promises);
              });
            });
          });
      })
      .then(() => {});
  },
};
export default updateListFromUnleashed;
