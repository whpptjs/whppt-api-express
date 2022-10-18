import assert from 'assert';
import { DatabaseDocument } from '../../Services';
import { HttpModule } from '../HttpModule';

import { UnleashedProduct } from './Models/UnleashedProduct';

export type UnleashedConfig = DatabaseDocument & {};

const updateListFromUnleashed: HttpModule<{}, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $unleashed, $logger, $database }) {
    $logger.info(`Getting products from unleashed`);
    return $database
      .then(({ document, startTransaction }) => {
        return $unleashed
          .$get('Products?pageSize=50', 'pageSize=50')
          .then((results: { Items: UnleashedProduct[]; Pagination: any }) => {
            let promiseChain = Promise.resolve();
            $logger.info(
              'Starting Unleashed Queries, Total pages: %s',
              results.Pagination.NumberOfPages
            );
            for (let i = 0; i < results.Pagination.NumberOfPages; i++) {
              promiseChain = promiseChain.then(() => {
                $logger.info('Unleashed query page no: %s', i + 1);
                return $unleashed
                  .$get(`Products/Page/${i + 1}?pageSize=50`, 'pageSize=50')
                  .then((_results: any) => {
                    return startTransaction(async (session: any) => {
                      $logger.info('Unleashed query page no: %s, Saving Data', i + 1);
                      const _savePromises = _results.Items.map((item: any) => {
                        assert(item.Guid, 'Unleashed item missing GUID.');
                        const config = {
                          ...item,
                          _id: item.Guid,
                        };

                        return Promise.all([
                          document.save('unleashed', config, { session }),
                          document.publish('unleashed', config, { session }),
                        ]);
                      });
                      return Promise.all(_savePromises);
                    });
                  });
              });
            }
          });
      })
      .then(() => {});
  },
};
export default updateListFromUnleashed;
