import { HttpModule } from '../HttpModule';
import { LoggedInMemberInfo, Secure } from './Secure';

const authMember: HttpModule<void, LoggedInMemberInfo> = {
  authorise(context) {
    if (context.member) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec(context) {
    return Promise.resolve(context.member.sub);
  },
};

export default Secure(authMember);
