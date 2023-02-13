import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import assert from 'assert';
import { Secure } from '../staff/Secure';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import * as validations from './Validations';

const dispatch: HttpModule<{ orderIds: string[]; staffId: string }, void> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderIds, staffId }) {
    assert(orderIds.length, 'At least one order Id is required');

    return context.$database.then(database => {
      const { db, document, startTransaction } = database as WhpptMongoDatabase;

      return db
        .collection('orders')
        .aggregate<Order>([
          {
            $match: { _id: { $in: orderIds }, dispatchedStatus: { $ne: 'dispatched' } },
          },
        ])
        .toArray()
        .then(orders => {
          if (!orders.length) return Promise.resolve();
          orders.forEach(order => {
            validations.hasBeenPaid(order);
            order.dispatchedStatus = 'dispatched';
          });
          return startTransaction(session => {
            const promiseChain = orders.reduce((prev: any, e: any) => {
              return prev.then(() => {
                const events = [
                  context.createEvent('OrderDispatched', {
                    orderId: e._id,
                    staffId,
                  }),
                ];
                return document.saveWithEvents('orders', e, events, { session });
              });
            }, Promise.resolve());

            return promiseChain;
          });
        });
    });
  },
};

export default Secure(dispatch);
