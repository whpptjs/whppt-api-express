import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Delivery } from './Models/Delivery';

const load: HttpModule<
  { domainId: string; postcode: string },
  { price: number | string | undefined; allowCheckout: boolean; message?: string }
> = {
  exec({ $database }, { domainId, postcode }) {
    assert(postcode, 'Postcode is required');
    assert(domainId, 'DomainId is required');
    return $database.then(({ document }) => {
      return document.fetch<Delivery>('site', `delivery_${domainId}`).then(delivery => {
        const metro = delivery.aus_metro.postcodes.find(f => f === postcode);
        const regional = delivery.aus_regional.postcodes.find(f => f === postcode);

        if (metro)
          return {
            price: delivery.aus_metro.price,
            allowCheckout: delivery.aus_metro.allowCheckout,
            message: delivery.aus_metro.message,
          };
        if (regional)
          return {
            price: delivery.aus_regional.price,
            allowCheckout: delivery.aus_regional.allowCheckout,
            message: delivery.aus_regional.message,
          };

        return {
          price: delivery.international.price,
          allowCheckout: delivery.international.allowCheckout,
          message: delivery.international.message,
        };
      });
    });
  },
};

export default load;
