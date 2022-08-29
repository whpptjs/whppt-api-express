import { ContextType } from '../context/Context';

export type HttpModule<ArgType, ReturnType = ArgType> = {
  authorise: (context: ContextType, args: ArgType & { user: any }, req?: any) => Promise<any>;
  exec: (context: ContextType, args: ArgType, req?: any) => Promise<ReturnType>;
};
