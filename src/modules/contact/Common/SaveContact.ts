import { ContextType } from 'src/context/Context';
import { Contact } from '../Models/Contact';

type LoadOrderWithProductsArgs = (
  context: ContextType,
  args: { contact: Contact; events: any[] },
  session: any
) => Promise<{ _id: string; firstName: string; lastName: string; email?: string }>;

export const saveContactAndPublish: LoadOrderWithProductsArgs = (
  { document },
  { contact, events },
  session
) => {
  return document
    .saveWithEvents('contacts', contact, events, { session })
    .then(() => {
      return document.publishWithEvents('contacts', contact, events, {
        session,
      });
    })
    .then(() => contact);
};
