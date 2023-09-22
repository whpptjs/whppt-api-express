import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Secure } from './Secure';
import { getStripCustomerIdFromMember } from '../../routers/Stripe/Queries';

const queryDoesMemberHaveSavedCards: HttpModule<
  {
    memberId: string;
  },
  { hasCards: boolean; cardStatus?: 'current' | 'expired' }
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
          if (!cards?.data?.length) return { hasCards: false, cardStatus: 'expired' };
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
          const currentYear = currentDate.getFullYear();

          let cardStatus = 'expired';

          cards.data.forEach((details: any) => {
            const cardMonth = details.card.exp_month;
            const cardYear = details.card.exp_year as number;

            if (cardYear < currentYear) return;
            if (cardMonth < currentMonth) return;
            cardStatus = 'current';
          });

          return { hasCards: false, cardStatus };
        });
    });
  },
};

export default Secure(queryDoesMemberHaveSavedCards);
