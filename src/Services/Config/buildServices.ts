import { WhpptConfig } from '.';

export type WhpptModuleService = {};

// TODO: Need to implement this nicely with types and generics
export type BuildServices = (config: WhpptConfig) => { [service: string]: any };
// export const buildServices: BuildServices = config => {
//   const _services = {};
//   forEach(config.services, (serviceValue, serviceName) => {
//     _services[`$${serviceName}`] = serviceValue(_context);
//   });
// };
