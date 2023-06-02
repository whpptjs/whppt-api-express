import { OrderItemWithProduct } from './../Models/Order';
import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { Delivery } from 'src/modules/delivery/Models/Delivery';
import { postcodeInRange } from '../../delivery/Queries/postcodeRange';
import { ShippingCost } from '../Models/Order';
import { calculateShippingPrice } from './helpers/calculateShippingPrice';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  args: {
    postcode?: string;
    domainId: string;
    pickup?: boolean;
    override?: ShippingCost;
    items: OrderItemWithProduct[];
  }
) => Promise<ShippingCost>;

export const getShippingCost: LoadOrderWithProductsArgs = (
  { $database },
  { postcode, domainId, pickup, override, items }
) => {
  if (pickup || !postcode)
    return Promise.resolve({
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    });

  if (override?.override) return Promise.resolve(override);
  return $database.then(({ document }) => {
    assert(postcode, 'Postcode is required');
    assert(domainId, 'DomainId is required');
    return document.fetch<Delivery>('site', `delivery_${domainId}`).then(delivery => {
      if (!delivery) throw new Error('Delivery must be set up');
      const metro = postcodeInRange(delivery.aus_metro.postcodes, parseInt(postcode, 10));
      const regional = postcodeInRange(
        delivery.aus_regional.postcodes,
        parseInt(postcode, 10)
      );

      if (metro)
        return {
          price: calculateShippingPrice(items, delivery.aus_metro.price) || 0,
          allowCheckout: delivery.aus_metro.allowCheckout,
          message: delivery.aus_metro.message,
          type: 'aus_metro',
        };

      if (regional)
        return {
          price: calculateShippingPrice(items, delivery.aus_regional.price) || 0,
          allowCheckout: delivery.aus_regional.allowCheckout,
          message: delivery.aus_regional.message,
          type: 'aus_regional',
        };

      return {
        price: calculateShippingPrice(items, delivery.international?.price) || 0,
        allowCheckout: delivery.international?.allowCheckout || false,
        message: delivery.international?.message,
        type: 'international',
      };
    });
  });
};
