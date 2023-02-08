import login from './login';
import getOrderFilters from './getOrderFilters';
import listOrders from './listOrders';
import createFromContact from './createFromContact';
import me from './me';
import list from './list';
import forgottenPassword from './forgottenPassword';
import resetPassword from './resetPassword';
import getMemberTier from './getMemberTier';
import save from './save';
import listReadyToDispatch from './listReadyToDispatch';

export const staff = {
  login,
  getOrderFilters,
  listOrders,
  list,
  createFromContact,
  me,
  forgottenPassword,
  resetPassword,
  getMemberTier,
  save,
  listReadyToDispatch,
};
