import { HttpModule } from '../HttpModule';
import { Secure } from './Secure';

const memberInfo: HttpModule<any, any> = {
  authorise(context) {
    if (context.member) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec({ $mongo: { $db } }, { memberId }) {
    return $db.collection('members').findOne({ _id: memberId });
  },
};

export const showMemberInfo = Secure(memberInfo);
