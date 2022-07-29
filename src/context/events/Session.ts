import { flatten, compact } from 'lodash';

export const EventSession = function (context: any) {
  return function () {
    let events = [] as any[];
    async function callAction(agg: any, action: any, args: any) {
      const _events = await agg[action](context, args);
      events = flatten([events, _events]);
    }
    return { callAction, getEvents: () => compact(events) };
  };
};
