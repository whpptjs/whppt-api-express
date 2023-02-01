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

              const _shipping = {
                contactDetails: {
                  firstName: firstName || loadedOrder?.shipping?.contactDetails.firstName,
                  lastName: lastName || loadedOrder?.shipping?.contactDetails.lastName,
                  company: loadedOrder?.shipping?.contactDetails?.company,
                },
                address: {
                  number: number || loadedOrder?.shipping?.address?.number,
                  street: street || loadedOrder?.shipping?.address?.street,
                  suburb: suburb || loadedOrder?.shipping?.address?.suburb,
                  postCode: postCode || loadedOrder?.shipping?.address?.postCode,
                  city: loadedOrder?.shipping?.address?.city,
                  state: state || loadedOrder?.shipping?.address?.state,
                  country: loadedOrder?.shipping?.address?.country,
                },
              };

              if (
                checkShippingAddressChanged(
                  _shipping.address,
                  loadedOrder.shipping.address
                ) ||
                checkShippingDetailsChanged(
                  _shipping.contactDetails,
                  loadedOrder.shipping.contactDetails
                )
              ) {
                events.push(
                  createEvent('OrderShippingDetailsUpdatedByStaff', {
                    _id: orderId,
                    shipping: _shipping,
                  })
                );
                loadedOrder.shipping = {
                  ...loadedOrder.shipping,
                  address: _shipping.address || {},
                  contactDetails: _shipping.contactDetails,
                };
              }

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

const checkShippingAddressChanged = (
  newAddress: {
    number: any;
    street: any;
    suburb: any;
    postCode: any;
    city?: string;
    state: any;
    country?: string;
  },
  oldAddress: {
    number: any;
    street: any;
    suburb: any;
    postCode: any;
    city?: string;
    state: any;
    country?: string;
  }
) => {
  if (newAddress.number !== oldAddress.number) return true;
  if (newAddress.street !== oldAddress.street) return true;
  if (newAddress.suburb !== oldAddress.suburb) return true;
  if (newAddress.postCode !== oldAddress.postCode) return true;
  if (newAddress.state !== oldAddress.state) return true;
  return false;
};
const checkShippingDetailsChanged = (
  newContactDetails: { firstName: any; lastName: any; company: any },
  oldContactDetails: { firstName: any; lastName: any; company: any }
) => {
  if (newContactDetails.firstName !== oldContactDetails.firstName) return true;
  if (newContactDetails.lastName !== oldContactDetails.lastName) return true;
  if (newContactDetails.company !== oldContactDetails.company) return true;
  return false;
};
