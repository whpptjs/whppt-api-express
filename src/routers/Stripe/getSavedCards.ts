import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { getStripCustomerIdFromMember } from './Queries';

export type StripeToken = {
  object: string;
  secret: string;
};

export type SaveCardOnContactArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { memberId: string }
) => Promise<{ customerId: string; cards: any[] }>;

export const getSavedCards: SaveCardOnContactArgs = (
  { context, stripe },
  { memberId }
) => {
  assert(memberId, 'MemberId not provided');
  return getStripCustomerIdFromMember(context, stripe, memberId).then(customer => {
    return stripe.customers
      .listPaymentMethods(customer, { type: 'card' })
      .then((cards: any) => {
        return { customerId: customer, cards: cards.data };
      });
  });
};
