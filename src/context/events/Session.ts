import { flatten, compact } from 'lodash';
import { ContextType } from '../Context';
import { DomainEvent } from './CreateEvent';
import { AggRoot } from './AggregateRoot';

export type EventSessionFactory = () => {
  callAction: <T>(agg: AggRoot, action: string, args: T) => void;
  getEvents: () => DomainEvent[];
};
export type EventSessionConstructor = (context: ContextType) => EventSessionFactory;

export const EventSession: EventSessionConstructor = function (context: ContextType) {
  return function () {
    let events = [] as any[];
    async function callAction(agg: any, action: any, args: any) {
      const _events = await agg[action](context, args);
      events = flatten([events, _events]);
    }
    return { callAction, getEvents: () => compact(events) };
  };
};
