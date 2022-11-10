import { HttpModule } from '../HttpModule';
import jwt from 'jsonwebtoken';

export type SecureModule = (module: HttpModule<any, any>) => HttpModule<any, any>;

export type LoggedInMemberInfo = {
  username: string;
  name: string;
};

type ParseMemberTokenFromCookie = (cookies: any) => LoggedInMemberInfo;
const parseMemberTokenFromCookie: ParseMemberTokenFromCookie = memberauthtoken => {
  const token = memberauthtoken;
  var decoded = jwt.verify(token, process.env.APP_KEY || '');
  return decoded as LoggedInMemberInfo;
};

export const Secure: SecureModule = module => {
  const secureModule: HttpModule<any, any> = {
    authorise: (context: any, args: any, req: any) => {
      if (!module) return Promise.reject({ status: 404, message: 'Module not found' });
      const member = parseMemberTokenFromCookie(req.headers.memberauthtoken);
      if (!member) return Promise.reject({ status: 404, message: 'Member not found' });
      if (!module.authorise) return Promise.resolve();
      return module.authorise({ ...context, member }, args, req);
    },
    exec: (context: any, args: any, req: any) => {
      const member = parseMemberTokenFromCookie(req.headers.memberauthtoken);
      return module.exec({ ...context, member }, args, req);
    },
  };
  return secureModule;
};
