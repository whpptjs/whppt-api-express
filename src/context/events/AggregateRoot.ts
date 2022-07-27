import { each } from 'lodash';
import { DomainEvent } from './CreateEvent';

export class AggRoot {
  apply(events: DomainEvent[]) {
    each(events, (event: DomainEvent) => {
      const self = this as any;
      if (self[event.eventType]) {
        self[event.eventType](event);
      }
    });
  }
}
