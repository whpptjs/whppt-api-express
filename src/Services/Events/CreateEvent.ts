export type DomainEvent = {
  eventType: string;
  timestamp: Date;
  user: any;
  data: any;
};

export const CreateEvent = (user: any) => {
  return (type: string, data: any) => {
    return {
      eventType: type,
      timestamp: new Date(),
      user,
      data,
    };
  };
};
