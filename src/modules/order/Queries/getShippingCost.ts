import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { Delivery } from 'src/modules/delivery/Models/Delivery';
import { postcodeInRange } from '../../delivery/Queries/postcodeRange';
import { ShippingCost } from '../Models/Order';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  args: { postcode?: string; domainId: string; pickup?: boolean }
) => Promise<ShippingCost>;

export const getShippingCost: LoadOrderWithProductsArgs = (
  { $database },
  { postcode, domainId, pickup }
) => {
  if (pickup)
    return Promise.resolve({
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    });
  return $database.then(({ document }) => {
    assert(postcode, 'Postcode is required');
    assert(domainId, 'DomainId is required');
    return document.fetch<Delivery>('site', `delivery_${domainId}`).then(delivery => {
      if (!delivery) throw new Error('Delivery must be set up');
      const metro = postcodeInRange(delivery.aus_metro.postcodes, postcode);
      const regional = postcodeInRange(delivery.aus_regional.postcodes, postcode);

      if (metro)
        return {
          price: delivery.aus_metro.price || 0,
          allowCheckout: delivery.aus_metro.allowCheckout,
          message: delivery.aus_metro.message,
          type: 'aus_metro',
        };

      if (regional)
        return {
          price: delivery.aus_regional.price || 0,
          allowCheckout: delivery.aus_regional.allowCheckout,
          message: delivery.aus_regional.message,
          type: 'aus_regional',
        };

      return {
        price: delivery.international?.price || 0,
        allowCheckout: delivery.international?.allowCheckout || false,
        message: delivery.international?.message,
        type: 'international',
      };
    });
  });
};
