export const sanitizeAddressString = (item?: string) => {
  return item && item !== 'null' ? `${item}, ` : '';
};

export const sanitizeUnitString = (item?: string) => {
  return item && item !== 'null' ? `${item}/` : '';
};

export const composeOrderData = (orderWithProducts: any, contact?: any) => {
  return {
    orderId: orderWithProducts.orderNumber || orderWithProducts._id,
    updatedAt: orderWithProducts.updatedAt,
    contact: {
      email: orderWithProducts?.contact?.email || contact?.email || '',
      phoneNumber: contact?.mobile || contact?.phoneNumber || '',
    },
    shipping: {
      contact: orderWithProducts?.shipping?.contactDetails,
      street: `${
        orderWithProducts?.shipping?.address?.number || ''
      } ${sanitizeAddressString(orderWithProducts?.shipping?.address?.street)} `,
      state: `${sanitizeAddressString(
        orderWithProducts?.shipping?.address?.suburb
      )} ${sanitizeAddressString(orderWithProducts?.shipping?.address?.state)} `,
      country: `${sanitizeAddressString(orderWithProducts?.shipping?.address?.country)} ${
        orderWithProducts?.shipping?.address?.postCode || ''
      }`,
    },
    items: orderWithProducts.items,
    note: orderWithProducts.note || '',
    staff: orderWithProducts.staff || '',
  };
};
