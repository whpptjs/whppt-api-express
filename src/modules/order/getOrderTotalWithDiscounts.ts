import { HttpModule } from '../HttpModule';
import { calculateTotal } from './Queries/calculateTotal';

const getOrderTotalWithDiscounts: HttpModule<
  { orderId: string; domainId: string; memberId?: string },
  any
> = {
  exec(context, { orderId, domainId, memberId }) {
    return calculateTotal(context, {
      orderId,
      domainId,
      memberId,
    });
  },
};

export default getOrderTotalWithDiscounts;
