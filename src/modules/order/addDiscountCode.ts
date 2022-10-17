import { HttpModule } from '../HttpModule';

const addDiscountCode: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    // events: [discountCodeAddedToOrder];
    return Promise.resolve({ status: 200 });
  },
};

export default addDiscountCode;
