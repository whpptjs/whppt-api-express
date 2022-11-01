import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';

const loadCart: HttpModule<{ orderId: string }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId }) {
    return loadOrderWithProducts(context, { _id: orderId }).then(order => {
      if (!order._id) return Promise.reject({ status: 404, message: 'Order not found' });
      return order;
    });
  },
};

export default loadCart;
