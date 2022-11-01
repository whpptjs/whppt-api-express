import { ContextType } from 'src/context/Context';
import { Order } from 'src/modules/order/Models/Order';

export type LoadOrderArgs = (context: ContextType, orderId: string) => Promise<Order>;

export const loadOrder: LoadOrderArgs = ({ $database }, orderId) => {
  return $database.then(database => {
    const { document } = database;
    return document.fetch('orders', orderId);
  });
};
