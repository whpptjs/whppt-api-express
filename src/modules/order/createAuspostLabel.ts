import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';

const createAuspostLabel: HttpModule<
  {
    orderId: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    firstName?: string;
    lastName?: string;
    number?: string;
    street?: string;
    suburb?: string;
    postCode?: string;
    state?: string;
  },
  Order
> = {
  exec(
    { $database, $auspost, createEvent },
    {
      orderId,
      length,
      width,
      height,
      weight,
      firstName,
      lastName,
      number,
      street,
      suburb,
      postCode,
      state,
    }
  ) {
    assert(orderId, 'Order Id not found');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        assert(loadedOrder, 'Order not found');
        assert(loadedOrder?.stripe?.status === 'paid', 'Order not in a paid status');
        assert(
          !loadedOrder?.shipping?.ausPost?.shipmentId,
          'Order already has a shipment Id'
        );

        const { createShipment, createLabel } = $auspost;

        return startTransaction(session => {
          return createShipment({
            order: loadedOrder,
            shippingDetails: {
              firstName,
              lastName,
              number,
              street,
              suburb,
              postCode,
              state,
            },
            length,
            width,
            height,
            weight,
          }).then((shipmentId: string) => {
            return createLabel(shipmentId).then((label_request_id: string) => {
              const events = [
                createEvent('AusPostLabelCreated', {
                  _id: orderId,
                  shipmentId,
                  label_request_id,
                }),
              ];
              assert(loadedOrder?.shipping, 'Order shipping is required');

              loadedOrder.shipping.ausPost = {
                shipmentId,
                label_request_id,
                status: 'labelPrinted',
              };
              return document.saveWithEvents('orders', loadedOrder, events, {
                session,
              });
            });
          });
        }).then(() => loadedOrder);
      });
    });
  },
};

export default Secure(createAuspostLabel);
