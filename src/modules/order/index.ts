import createOrderWithProduct from './createOrderWithProduct';
import createOrderWithMember from './createOrderWithMember';
import changeOrderItemQuantity from './changeOrderItemQuantity';

import addGiftCard from './addGiftCard';
import removeGiftCard from './removeGiftCard';
import addDiscountCode from './addDiscountCode';
import removeDiscountCode from './removeDiscountCode';
import startCheckout from './startCheckout';
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
import changeNote from './changeNote';
import addMember from './addMember';
import removeMember from './removeMember';
import refund from './refund';
import sendReceipt from './sendReceipt';
import refundViaCash from './refundViaCash';
import createAuspostShipment from './createAuspostShipment';
import getAusPostLabel from './getAusPostLabel';
import confirmCashPayment from './confirmCashPayment';
import markOrderAsPointOfSale from './markOrderAsPointOfSale';
import addGuestToOrder from './addGuestToOrder';
import setDiner from './setDiner';
import listReadyToDispatch from './listReadyToDispatch';
import dispatch from './dispatch';
import requestCall from './requestCall';
import getProductSales from './getProductSales';
import overrideShippingCost from './overrideShippingCost';
import changeItemPrice from './changeItemPrice';
import overrideTotalPrice from './overrideTotalPrice';
import cancelOverrideTotalPrice from './cancelOverrideTotalPrice';
import getOrderTotalWithDiscounts from './getOrderTotalWithDiscounts';

export const order = {
  createOrderWithProduct,
  createOrderWithMember,
  changeOrderItemQuantity,
  addGiftCard,
  removeGiftCard,
  addDiscountCode,
  removeDiscountCode,
  startCheckout,
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
  changeNote,
  addMember,
  removeMember,
  refund,
  sendReceipt,
  refundViaCash,
  createAuspostShipment,
  getAusPostLabel,
  confirmCashPayment,
  markOrderAsPointOfSale,
  addGuestToOrder,
  setDiner,
  listReadyToDispatch,
  dispatch,
  getProductSales,
  requestCall,
  overrideShippingCost,
  changeItemPrice,
  overrideTotalPrice,
  getOrderTotalWithDiscounts,
  cancelOverrideTotalPrice,
};
