import { HttpModule } from '../HttpModule';

const prepareOrder: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     orderPrepared,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default prepareOrder;
