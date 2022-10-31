import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { getStripCustomerIdFromContact } from './Helpers';

export type StripeToken = {
  object: string;
  secret: string;
};

export type SaveCardOnContactArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { contactId: string }
) => Promise<void>;

export const getSavedCards: SaveCardOnContactArgs = (
  { context, stripe },
  { contactId }
) => {
  assert(contactId, 'ContactId not provided');
  return getStripCustomerIdFromContact(context, stripe, contactId).then(customer => {
    return stripe.customers
      .listPaymentMethods(customer, { type: 'card' })
      .then((cards: any) => {
        return { customerId: customer, cards: cards.data };
      });
  });
};
