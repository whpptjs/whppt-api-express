import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Delivery } from './Models/Delivery';

export const saveConfig: HttpModule<{ domainId: string; delivery: Delivery }, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, { domainId, delivery }) {
    assert(domainId, 'DomainId is required');
    assert(delivery, 'Delivery is required');
    return $database.then(({ document, startTransaction }) => {
      const events = [] as any[];

      delivery._id = delivery._id || `delivery_${domainId}`;

      events.push(createEvent('DeliveryConfigSaved', { _id: delivery._id, delivery }));
      return startTransaction(session => {
        return document.saveWithEvents('site', delivery, events, { session }).then(() => {
          return document.publishWithEvents('site', delivery, events, {
            session,
          });
        });
      });
    });
  },
};

export default saveConfig;
