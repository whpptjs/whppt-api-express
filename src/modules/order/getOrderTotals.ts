import { HttpModule } from '../HttpModule';
import { calculateTotal } from './Queries/calculateTotal';

const getOrderTotals: HttpModule<
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

export default getOrderTotals;
