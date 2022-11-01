import createOrderWithProduct from './createOrderWithProduct';
import changeOrderItemQuantity from './changeOrderItemQuantity';

import addGiftCard from './addGiftCard';
import removeGiftCard from './removeGiftCard';
import addDiscountCode from './addDiscountCode';
import removeDiscountCode from './removeDiscountCode';
import startCheckout from './startCheckout';
import continueToPayment from './continueToPayment';
import confirmStripePayment from './confirmStripePayment';
import cancelOrder from './cancelOrder';
import prepareOrder from './prepareOrder';
import shipOrder from './shipOrder';
import findOrderForSession from './findOrderForSession';
import loadCart from './loadCart';
import removeOrderItem from './removeOrderItem';
import addOrderItem from './addOrderItem';
import recordContactInformation from './recordContactInformation';
import changeOrderShippingDetails from './changeOrderShippingDetails';
import changeOrderBilling from './changeOrderBilling';

export const order = {
  createOrderWithProduct,
  changeOrderItemQuantity,
  addGiftCard,
  removeGiftCard,
  addDiscountCode,
  removeDiscountCode,
  startCheckout,
  continueToPayment,
  confirmStripePayment,
  cancelOrder,
  prepareOrder,
  shipOrder,
  findOrderForSession,
  loadCart,
  removeOrderItem,
  addOrderItem,
  recordContactInformation,
  changeOrderShippingDetails,
  changeOrderBilling,
};
