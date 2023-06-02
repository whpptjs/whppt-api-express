import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Delivery } from './Models/Delivery';
import { postcodeInRange } from './Queries/postcodeRange';

const load: HttpModule<
  { domainId: string; postcode: string },
  { price: number | string | undefined; allowCheckout: boolean; message?: string }
> = {
  exec({ $database }, { domainId, postcode }) {
    assert(postcode, 'Postcode is required');
    assert(domainId, 'DomainId is required');
    return $database.then(({ document }) => {
      return document.fetch<Delivery>('site', `delivery_${domainId}`).then(delivery => {
        const metro = postcodeInRange(
          delivery.aus_metro.postcodes,
          parseInt(postcode, 10)
        );

        if (metro)
          return {
            price: delivery.aus_metro.price,
            allowCheckout: delivery.aus_metro.allowCheckout,
            message: delivery.aus_metro.message,
            type: 'aus_metro',
          };

        const regional = postcodeInRange(
          delivery.aus_regional.postcodes,
          parseInt(postcode, 10)
        );

        if (regional)
          return {
            price: delivery.aus_regional.price,
            allowCheckout: delivery.aus_regional.allowCheckout,
            message: delivery.aus_regional.message,
            type: 'aus_regional',
          };

        return {
          price: delivery.international.price,
          allowCheckout: delivery.international.allowCheckout,
          message: delivery.international.message,
          type: 'international',
        };
      });
    });
  },
};

export default load;
