export const sanitizeAddressString = (item?: string) => {
  return item ? `${item}, ` : '';
};

export const composeOrderData = (orderWithProducts: any) => {
  return {
    orderId: orderWithProducts._id,
    updatedAt: orderWithProducts.updatedAt,
    shipping: {
      contact: orderWithProducts?.shipping?.contactDetails,
      street: `${
        orderWithProducts?.shipping?.address?.number || ''
      } ${sanitizeAddressString(orderWithProducts?.shipping?.address?.street)} `,
      state: `${sanitizeAddressString(
        orderWithProducts?.shipping?.address?.suburb
      )} ${sanitizeAddressString(
        orderWithProducts?.shipping?.address?.city
      )} ${sanitizeAddressString(orderWithProducts?.shipping?.address?.state)} `,
      country: `${sanitizeAddressString(orderWithProducts?.shipping?.address?.country)} ${
        orderWithProducts?.shipping?.address?.postCode || ''
      }`,
    },
    items: orderWithProducts.items,
    note: orderWithProducts.note || '',
    staffContactInfo: orderWithProducts.staffContactInfo || '',
  };
};
