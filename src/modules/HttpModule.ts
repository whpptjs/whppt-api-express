import { ContextType } from '../context/Context';

export type HttpModule<ArgType, ReturnType = ArgType> = {
  authorise: (context: ContextType, args: ArgType & { user: any }) => Promise<any>;
  exec: (context: ContextType, args: ArgType) => Promise<ReturnType>;
};
