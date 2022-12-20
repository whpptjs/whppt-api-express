import { HttpModule } from '../HttpModule';
import { Delivery } from './Models/Delivery';

const load: HttpModule<{ domainId: string }, Delivery> = {
  exec({ $database }, { domainId }) {
    return $database.then(({ document }) => {
      return document.fetch<Delivery>('site', `delivery_${domainId}`).then(delivery => {
        return delivery || {};
      });
    });
  },
};

export default load;
