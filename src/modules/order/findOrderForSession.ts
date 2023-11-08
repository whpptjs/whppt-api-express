import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

import { Order } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { ContextType } from 'src/context/Context';

const findOrderForSession: HttpModule<
  { orderId?: string; memberId?: string },
  Order | {}
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId, memberId }) {
    if (!orderId && !memberId) return Promise.resolve({});
    return findOrder(context, orderId, memberId).then(orderIdToQuery => {
      if (!orderIdToQuery) return {};

      return loadOrderWithProducts(context, { _id: orderIdToQuery }).catch(err => {
        if (err.status === 404) return {};
        throw err;
      });
    });
  },
};

type FindOrder = (
  context: ContextType,
  orderId?: string,
  memberId?: string
) => Promise<string | undefined>;

const findOrder: FindOrder = (context, orderId, memberId) => {
  return context.$database.then(database => {
    const { document, db } = database as WhpptMongoDatabase;

    const _idQuery = { _id: orderId };
    const _memberIdQuery = {
      $or: [{ fromPos: { $exists: false } }, { fromPos: { $eq: false } }],
      checkoutStatus: 'pending',
      memberId,
    };

    return Promise.all([
      document.query<Order>('orders', { filter: _idQuery }),
      db.collection('orders').find(_memberIdQuery).sort({ updatedAt: -1 }).toArray(),
    ]).then(([mainOrder, memberOrders]) => {
      console.log(
        '🚀 ~ file: findOrderForSession.ts:49 ~ ]).then ~ mainOrder:',
        mainOrder?._id
      );
      const _memberOrder = memberOrders.length && (memberOrders[0] as any);
      console.log(
        '🚀 ~ file: findOrderForSession.ts:71 ~ ]).then ~ _memberOrder:',
        _memberOrder?._id
      );

      return mainOrder ? orderId : _memberOrder ? _memberOrder?._id : undefined;
    });
    // return document.query<Order>('orders', { filter: matchQuery }).then(order => {
  });
};

export default findOrderForSession;
