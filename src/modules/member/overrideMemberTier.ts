import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { MembershipOptions } from '../membershipTier/Models/MembershipTier';

const overrideMemberTier: HttpModule<
  { domainId: string; membershipTierId: string; memberId: string },
  any
> = {
  exec(context, { domainId, membershipTierId, memberId }) {
    return context.$database.then(database => {
      return database.document
        .query<MembershipOptions>('site', {
          filter: { _id: `membershipOptions_${domainId}` },
        })
        .then(membershipOptions => {
          const { db } = database as WhpptMongoDatabase;

          if (
            membershipOptions?.membershipTiers.some(
              ({ _id }: { _id: string }) => _id === membershipTierId
            )
          ) {
            return db
              .collection('members')
              .findOneAndUpdate(
                { _id: memberId },
                { $set: { lockToTier: membershipTierId } }
              );
          } else if (membershipTierId === '') {
            return db
              .collection('members')
              .findOneAndUpdate({ _id: memberId }, { $unset: { lockToTier: null } });
          }

          return Promise.resolve(undefined);
        });
    });
  },
};

export default overrideMemberTier;
