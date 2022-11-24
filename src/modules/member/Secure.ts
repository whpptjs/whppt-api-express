import { HttpModule } from '../HttpModule';
import jwt from 'jsonwebtoken';

export type SecureModule = (module: HttpModule<any, any>) => HttpModule<any, any>;

export type LoggedInMemberInfo = {
  username: string;
  name: string;
};

type ParseMemberTokenFromCookie = (cookies: any, appKey: string) => LoggedInMemberInfo;
const parseMemberTokenFromCookie: ParseMemberTokenFromCookie = (
  memberauthtoken,
  appKey
) => {
  const token = memberauthtoken;
  var decoded = jwt.verify(token, appKey);

  return decoded as LoggedInMemberInfo;
};

export const Secure: SecureModule = module => {
  const secureModule: HttpModule<any, any> = {
    authorise: (context, args: any, req: any) => {
      return context.$hosting.then(config => {
        if (!module) return Promise.reject({ status: 404, message: 'Module not found' });
        const member = parseMemberTokenFromCookie(
          req.headers.memberauthtoken,
          config.security.appKey
        );
        if (!member) return Promise.reject({ status: 404, message: 'Member not found' });
        if (!module.authorise) return Promise.resolve();
        return module.authorise({ ...context, member }, args, req);
      });
    },
    exec: (context, args: any, req: any) => {
      return context.$hosting.then(config => {
        const member = parseMemberTokenFromCookie(
          req.headers.memberauthtoken,
          config.security.appKey
        );
        return module.exec({ ...context, member }, args, req);
      });
    },
  };
  return secureModule;
};
