import { HttpModule } from '../HttpModule';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { getOrderTemplate } from './Templates/emailReceipt';

const sendReceipt: HttpModule<{ orderId: string; email: string }, void> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId, email }) {
    return loadOrderWithProducts(context, { _id: orderId }).then(order => {
      if (!order._id) return Promise.reject({ status: 404, message: 'Order not found' });

      if (order._id && email) {
        return context.$email.send({
          to: email,
          subject: `Hentley Farm receipt${
            order._id || order.number ? ` for order ${order._id || order.number}` : ''
          }`,
          html: getOrderTemplate(order),
        });
      }
    });
  },
};

export default sendReceipt;
