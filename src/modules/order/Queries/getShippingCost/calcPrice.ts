import { Delivery } from '../../../delivery/Models/Delivery';
import { postcodeInRange } from '../../../delivery/Queries/postcodeRange';
import { OrderItemWithProduct, ShippingCost } from './../../Models/Order';
import { calculateShippingPrice } from '../helpers/calculateShippingPrice';

export type CalcShipingCost = (args: {
  postcode?: string;
  country?: string;
  delivery: Delivery;
  pickup?: boolean;
  override?: ShippingCost;
  items: OrderItemWithProduct[];
}) => ShippingCost;

export const calcShipingCost: CalcShipingCost = ({
  postcode,
  delivery,
  pickup,
  override,
  items,
  country,
}) => {
  if (pickup || !postcode)
    return {
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    };

  if (override?.override) return override;
  const metro = postcodeInRange(delivery.aus_metro.postcodes, parseInt(postcode, 10));
  const regional = postcodeInRange(
    delivery.aus_regional.postcodes,
    parseInt(postcode, 10)
  );
  if (!country || (country !== 'AU' && country !== 'Australia'))
    return {
      price: calculateShippingPrice(items, delivery.international?.price) || 0,
      allowCheckout: delivery.international?.allowCheckout || false,
      message: delivery.international?.message,
      type: 'international',
    };
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
};
