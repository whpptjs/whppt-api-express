import { HttpModule } from '../HttpModule';
import assert from 'assert';
import { omit } from 'lodash';
import { Member } from './Model';

const login: HttpModule<any, any> = {
  exec({ $mongo: { $db }, $security, $logger }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    type MemberProjection = Pick<Member, 'username' | 'email' | 'password'>;

    return $db
      .collection<Member>('members')
      .findOne<MemberProjection>(
        {
          $or: [{ username }, { email: username }],
        },
        {
          username: true,
          email: true,
          password: true,
        } as any
      )
      .then((member: MemberProjection | null) => {
        if (!member)
          return Promise.reject(new Error('Something went wrong. Could not log you in.'));

        return $security.encrypt(password).then((encrypted: string) => {
          $logger.dev('Checking password for member %s, %s', username, encrypted);

          return $security
            .compare(password, member.password)
            .then((passwordMatches: boolean) => {
              if (passwordMatches)
                return $security
                  .createToken('legacy', omit(member, ['password']))
                  .then(token => {
                    return {
                      token,
                    };
                  });

              return Promise.reject(new Error('Something went wrong. Could not log in.'));
            });
        });
      });
  },
};

export default login;
