import { HttpModule } from '../HttpModule';
import jwt from 'jsonwebtoken';

export type SecureModule = (module: HttpModule<any, any>) => HttpModule<any, any>;

export type LoggedInMemberInfo = {
  username: string;
  name: string;
};

type ParseMemberTokenFromCookie = (cookies: any, appKey: string) => LoggedInMemberInfo;
const parseMemberTokenFromCookie: ParseMemberTokenFromCookie = (
  staffauthtoken,
  appKey
) => {
  const token = staffauthtoken;
  var decoded = jwt.verify(token, appKey);

  return decoded as LoggedInMemberInfo;
};

export const Secure: SecureModule = module => {
  const secureModule: HttpModule<any, any> = {
    authorise: (context, args: any, req: any) => {
      return context.$hosting.then(config => {
        if (!module) return Promise.reject({ status: 404, message: 'Module not found' });

        const staff = parseMemberTokenFromCookie(
          req.headers.staffauthtoken,
          config.security.appKey
        );
        if (!staff) return Promise.reject({ status: 404, message: 'Member not found' });
        if (!module.authorise) return Promise.resolve();
        return module.authorise({ ...context, staff }, args, req);
      });
    },
    exec: (context, args: any, req: any) => {
      return context.$hosting.then(config => {
        const staff = parseMemberTokenFromCookie(
          req.headers.staffauthtoken,
          config.security.appKey
        );
        return module.exec({ ...context, staff }, args, req);
      });
    },
  };
  return secureModule;
};
