import { flatten, compact } from 'lodash';

export const Session = function () {
  return function (context) {
    let events = [];
    async function callAction(agg, action, args) {
      const _events = await agg[action](context, args);
      events = flatten([events, _events]);
    }
    return { callAction, getEvents: () => compact(events) };
  };
};
