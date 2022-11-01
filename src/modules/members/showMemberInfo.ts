import { HttpModule } from '../HttpModule';
import { Member } from './Model';
import { Secure } from './Secure';

const memberInfo: HttpModule<{ memberId: string }, Member> = {
  authorise(context) {
    if (context.member) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec({ $database }, { memberId }) {
    return $database.then(({ document }) => {
      return document.fetch<Member>('members', memberId);
    });
  },
};

export const showMemberInfo = Secure(memberInfo);
