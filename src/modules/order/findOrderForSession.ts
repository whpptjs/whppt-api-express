import { HttpModule } from '../HttpModule';

import { Order } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';

const findOrderForSession: HttpModule<{ orderId?: string }, Order | {}> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId }) {
    const query = orderId ? { _id: orderId } : { checkoutStatus: 'pending' };
    return loadOrderWithProducts(context, query);
  },
};

export default findOrderForSession;
