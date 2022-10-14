import { HttpModule } from '../HttpModule';

const continueToPayment: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     createContact,
    //     billingAddressAddedToContact,
    //     shippingAddressAddedToContact,
    //     contactAddedToOrder,
    //     billingAddressAddedToOrder,
    //     shippingAddressAddedToOrder
    //     shippingMethodChosenOnOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default continueToPayment;
