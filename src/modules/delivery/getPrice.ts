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
        const metro = delivery.aus_metro.postcodes.find(f => {
          const lowEnd = f.split('-')[0];
          const highEnd = f.split('-')[1];
          if (!highEnd) return lowEnd === postcode;
          const _range = postcodeRange(Number(lowEnd), Number(highEnd));
          return _range.find(inRangeCode => inRangeCode === postcode);
        });

        if (metro)
          return {
            price: delivery.aus_metro.price,
            allowCheckout: delivery.aus_metro.allowCheckout,
            message: delivery.aus_metro.message,
            type: 'aus_metro',
          };
        const regional = delivery.aus_regional.postcodes.find(f => {
          const lowEnd = f.split('-')[0];
          const highEnd = f.split('-')[1];
          if (!highEnd) return lowEnd === postcode;
          const _range = postcodeRange(Number(lowEnd), Number(highEnd));
          return _range.find(inRangeCode => inRangeCode === postcode);
        });
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

export const postcodeRange = (start: number, end: number) => {
  var _start = start;
  var arr = new Array(end - start + 1);
  for (var i = 0; i < arr.length; i++, _start++) {
    arr[i] = `${_start}`;
  }
  return arr;
};
