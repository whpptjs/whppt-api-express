import { ContextType } from '../context/Context';

export type WhpptModule = { [command: string]: HttpModule<any, any> };

export type HttpModule<ArgType, ReturnType = ArgType> = {
  authorise?: (
    context: ContextType,
    args: ArgType & { user: any },
    req?: any
  ) => Promise<any>;
  exec: (context: ContextType, args: ArgType, req?: any) => Promise<ReturnType>;
};
