import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
const listAllOrders: HttpModule<{ orderId: string }, Order[]> = {
  exec({ $database }) {
    return $database.then(({ queryDocuments }) => {
      return queryDocuments<Order>('orders', {
        filter: { checkoutStatus: { $ne: 'pending' } },
      });
    });
  },
};
export default listAllOrders;
