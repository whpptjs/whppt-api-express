import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { MembershipOptions } from './Models/MembershipTier';

export const saveConfig: HttpModule<
  { domainId: string; membershipOptions: MembershipOptions },
  void
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, { domainId, membershipOptions }) {
    assert(domainId, 'DomainId is required');
    assert(membershipOptions, 'Membership Options is required');

    return $database.then(({ document, startTransaction }) => {
      const events = [] as any[];

      membershipOptions._id = membershipOptions._id || `membershipOptions_${domainId}`;

      events.push(
        createEvent('MembershipOptionsSaved', {
          _id: membershipOptions._id,
          membershipOptions,
        })
      );
      return startTransaction(session => {
        return document
          .saveWithEvents('site', membershipOptions, events, { session })
          .then(() => {});
      });
    });
  },
};

export default saveConfig;
