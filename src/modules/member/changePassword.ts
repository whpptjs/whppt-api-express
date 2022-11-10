import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const changePassword: HttpModule<
  {
    memberId: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  },
  void
> = {
  exec(
    { $database, createEvent, $security },
    { memberId, currentPassword, newPassword, confirmNewPassword }
  ) {
    assert(memberId, 'A member id is required');
    assert(newPassword, 'A new password is required');
    assert(currentPassword, 'A current password required');
    assert(confirmNewPassword, 'A current password required');

    assert(
      newPassword === confirmNewPassword,
      "New password doesn't match confirmation password."
    );

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document.fetch<Member>('members', memberId).then(member => {
        assert(member, 'Could not find member.');

        return $security.encrypt(newPassword).then(encryptedNew => {
          return $security
            .compare(currentPassword, member.password as string)
            .then((passwordMatches: boolean) => {
              if (!passwordMatches)
                return Promise.reject(
                  new Error("The current password that you've entered is incorrect.")
                );

              const memberEvents = [createEvent('ChangedPassword', { memberId })];
              member.password = encryptedNew;

              return startTransaction(session => {
                return document.saveWithEvents('members', member, memberEvents, {
                  session,
                });
              });
            });
        });
      });
    });
  },
};

export default changePassword;
