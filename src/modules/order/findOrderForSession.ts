import { HttpModule } from '../HttpModule';

import { Order } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';

const findOrderForSession: HttpModule<
  { orderId?: string; memberId?: string },
  Order | {}
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId, memberId }) {
    const _idQuery = { _id: orderId };
    const _memberIdQuery = { checkoutStatus: 'pending', memberId };

    const query =
      orderId && memberId
        ? { $or: [_idQuery, _memberIdQuery] }
        : orderId
        ? _idQuery
        : memberId
        ? _memberIdQuery
        : undefined;

    if (!orderId && !memberId) return Promise.resolve({});
    return loadOrderWithProducts(context, query).catch(err => {
      if (err.status === 404) return {};
      throw err;
    });
  },
};

export default findOrderForSession;
