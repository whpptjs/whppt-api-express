import { ContextType } from 'src/context/Context';
import { Contact } from '../Models/Contact';

type SubscriptionArgs = (
  context: ContextType & { document: any },
  args: { contact: Contact; optInMarketing: boolean },
  session: any
) => Promise<void>;

export const ToggleSubscription: SubscriptionArgs = (
  { document, createEvent },
  { contact, optInMarketing },
  session
) => {
  if (contact.isSubscribed === optInMarketing) return Promise.resolve();
  contact.isSubscribed = optInMarketing;
  const events = [
    optInMarketing
      ? createEvent('ContactOptedInForMarketing', {
          contactId: contact._id,
          isSubscribed: optInMarketing,
        })
      : createEvent('ContactOptedOutForMarketing', {
          contactId: contact._id,
          isSubscribed: optInMarketing,
        }),
  ];
  return document
    .saveWithEvents('contacts', contact, events, { session })
    .then(() => {
      return document.publishWithEvents('contacts', contact, events, {
        session,
      });
    })
    .then(() => contact);
};
