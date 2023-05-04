import { ContextType } from 'src/context/Context';
import { Contact } from '../Models/Contact';

type SubscriptionArgs = (
  context: ContextType & { document: any },
  args: { contact: Contact; isSubscribed: boolean },
  session: any
) => Promise<void>;

export const ToggleSubscription: SubscriptionArgs = (
  { document, createEvent },
  { contact, isSubscribed },
  session
) => {
  if (contact.isSubscribed === isSubscribed) return Promise.resolve();
  contact.isSubscribed = isSubscribed;
  const events = [
    isSubscribed
      ? createEvent('ContactOptedInForMarketing', {
          contactId: contact._id,
          isSubscribed,
        })
      : createEvent('ContactOptedOutForMarketing', {
          contactId: contact._id,
          isSubscribed,
        }),
  ];
  return document
    .saveWithEvents('contacts', contact, events, { session })
    .then(() => {
      if (process.env.DRAFT !== 'true') return;

      return document.publishWithEvents('contacts', contact, events, {
        session,
      });
    })
    .then(() => contact);
};
