import { HttpModule } from '../HttpModule';

const removeDiscountCode: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     discountCodeRemovedFromOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default removeDiscountCode;
