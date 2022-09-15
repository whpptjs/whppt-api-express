import debug from 'debug';

export type LoggerService = {
  info: debug.Debugger;
  error: debug.Debugger;
  warning: debug.Debugger;
  dev: debug.Debugger;
};
export type LoggerServiceConstructor = () => LoggerService;

export const Logger: LoggerServiceConstructor = () => ({
  info: debug('whppt:info'),
  error: debug('whppt:error'),
  warning: debug('whppt:warning'),
  dev: debug('whppt:dev'),
});
