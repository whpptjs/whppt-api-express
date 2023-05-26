import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { getOrderTemplate } from '../email/Templates/emailReceipt';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
const sendReceipt: HttpModule<
  { orderId: string; email: string; domainId: string },
  void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId, email, domainId }) {
    return loadOrderWithProducts(context, { _id: orderId }).then(order => {
      assert(order._id, 'OrderId is required');
      assert(email, 'Email is required');

      return context.$email.send({
        to: email,
        subject: `Hentley Farm receipt${
          order.orderNumber || order._id
            ? ` for order #${order.orderNumber || order._id}`
            : ''
        }`,
        html: getOrderTemplate(order, domainId),
      });
    });
  },
};

export default sendReceipt;
