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
    const query = orderId
      ? { _id: orderId }
      : memberId
      ? { checkoutStatus: 'pending', memberId }
      : undefined;
    if (!orderId) return Promise.resolve({});
    return loadOrderWithProducts(context, query);
  },
};

export default findOrderForSession;
