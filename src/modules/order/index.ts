import createOrderWithProduct from './createOrderWithProduct';
import changeOrderItemQuantity from './changeOrderItemQuantity';

import addGiftCard from './addGiftCard';
import removeGiftCard from './removeGiftCard';
import addDiscountCode from './addDiscountCode';
import removeDiscountCode from './removeDiscountCode';
import startCheckout from './startCheckout';
import continueToPayment from './continueToPayment';
import completeOrder from './completeOrder';
import cancelOrder from './cancelOrder';
import prepareOrder from './prepareOrder';
import shipOrder from './shipOrder';
import findOrderForSession from './findOrderForSession';
import loadCart from './loadCart';

export const order = {
  createOrderWithProduct,
  changeOrderItemQuantity,
  addGiftCard,
  removeGiftCard,
  addDiscountCode,
  removeDiscountCode,
  startCheckout,
  continueToPayment,
  completeOrder,
  cancelOrder,
  prepareOrder,
  shipOrder,
  findOrderForSession,
  loadCart,
};
