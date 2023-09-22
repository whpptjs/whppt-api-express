import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Secure } from './Secure';
import { getStripCustomerIdFromMember } from 'src/routers/Stripe/Queries';

const queryDoesMemberHaveSavedCards: HttpModule<
  {
    memberId: string;
  },
  { hasCards: boolean; status?: 'current' | 'expired' }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ stripe, ...context }, { memberId }) {
    assert(memberId, 'A memberId is required');

    return getStripCustomerIdFromMember(context, stripe, memberId).then(customer => {
      return stripe.customers
        .listPaymentMethods(customer, { type: 'card' })
        .then((cards: any) => {
          console.log('🚀  cards:', cards);
          return { hasCards: false, status: 'expired' };
        });
    });
  },
};

export default Secure(queryDoesMemberHaveSavedCards);
