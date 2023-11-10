import { Delivery } from '../../../delivery/Models/Delivery';

export const delivery = {
  _id: 'delivery_vl8z483o6',
  aus_metro: {
    postcodes: [
      '1000-1999',
      '2000-2249',
      '2555-2574',
      '2740-2786',
      '0200-0299',
      '2600-2620',
      '2900-2920',
      '3000-3210',
      '3335-3341',
      '3425-3443',
      '3750-3811',
      '3910-3920',
      '3926-3944',
      '3972-3978',
      '3980-3983',
      '8000-8999',
      '4000-4209',
      '4500-4549',
      '4230-4299',
      '9000-9799',
      '5000-5199',
      '5800-5999',
      '6000-6205',
      '6800-6999',
    ],
    price: 1500,
    allowCheckout: true,
  },
  aus_regional: {
    postcodes: [
      '2282-2310',
      '2500-2506',
      '2515-2530',
      '2250-2263',
      '2264-2281',
      '2311-2499',
      '2507-2514',
      '2531-2554',
      '2575-2599',
      '2621-2739',
      '2787-2899',
      '3214-3220',
      '3350',
      '3353-3356',
      '3211-3213',
      '3221-3334',
      '3342-3349',
      '3351-3352',
      '3357-3424',
      '3444-3749',
      '3812-3909',
      '3921-3925',
      '3945-3971',
      '3979',
      '3984-3999',
      '4210-4229',
      '4550-4575',
      '4300-4307',
      '4308-4499',
      '4576-4689',
      '4690-4699',
      '4700-4899',
      '5200-5749',
      '6206-6699',
      '6700-6797',
      '7000-7999',
      '0800-0899',
      '0900-0999',
    ],
    price: 2000,
    allowCheckout: true,
  },
  international: { message: 'Someone will contact you.', allowCheckout: false },
} as Delivery;