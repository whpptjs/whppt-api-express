import { OrderItemWithProduct } from '../../Models/Order';
import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { Delivery } from 'src/modules/delivery/Models/Delivery';
import { ShippingCost } from '../../Models/Order';
import { calcShipingCost } from './calcPrice';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  args: {
    postcode?: string;
    country?: string;
    domainId: string;
    pickup?: boolean;
    override?: ShippingCost;
    items: OrderItemWithProduct[];
  }
) => Promise<ShippingCost>;

export const getShippingCost: LoadOrderWithProductsArgs = (
  { $database },
  { postcode, domainId, pickup, override, items, country }
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

      return calcShipingCost({
        postcode,
        country,
        delivery,
        pickup,
        override,
        items,
      });
    });
  });
};
