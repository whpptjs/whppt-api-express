import assert from 'assert';
import { ContextType } from '../../context/Context';
import { Order } from 'src/modules/order/Models/Order';

export type LoadOrderArgs = (context: ContextType, orderId: string) => Promise<Order>;
export type GetStripCustomerIdFromContactArgs = (
  context: ContextType,
  stripe: any,
  contactId: string | undefined
) => Promise<Order>;

export const loadOrder: LoadOrderArgs = ({ $database }, orderId) => {
  return $database.then(database => {
    const { document } = database;

    return document.fetch('orders', orderId);
  });
};

export const getStripCustomerIdFromContact: GetStripCustomerIdFromContactArgs = (
  { $database },
  stripe,
  contactId
) => {
  if (!contactId) return Promise.resolve();
  return $database.then(database => {
    const { document } = database;

    return document.fetch('contacts', contactId).then(contact => {
      assert(contact, 'Contact Not Found.');
      if (contact.stripeCustomerId) return contact.stripeCustomerId;
      const name = `${contact.firstName} ${contact.lastName}`;
      return stripe.customers.create({ name }).then((customer: any) => {
        contact.stripeCustomerId = customer.id;
        return document.save('contacts', contact).then(() => {
          return contact.stripeCustomerId;
        });
      });
    });
  });
};
