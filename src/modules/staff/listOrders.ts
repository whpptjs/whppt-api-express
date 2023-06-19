import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../order/Models/Order';
import { Secure } from './Secure';

export type ListOrdersRetured = {
  orders: any[];
  total: number;
};

const listOrders: HttpModule<
  {
    search: string;
    limit: string;
    dateFromYear?: number;
    dateFromMonth?: number;
    dateFromDay?: number;
    dateToYear?: number;
    dateToMonth?: number;
    dateToDay?: number;
    currentPage: string;
    status: string;
    origin?: string;
  },
  ListOrdersRetured
> = {
  exec(
    { $database },
    {
      search,
      dateFromYear,
      dateFromMonth,
      dateFromDay,
      dateToYear,
      dateToMonth,
      dateToDay,
      limit = '10',
      currentPage = '0',
      status,
      origin,
    }
  ) {
    return $database.then(database => {
      const { db, queryDocuments } = database as WhpptMongoDatabase;

      const query = {
        $and: [
          { _id: { $exists: true } },
          { checkoutStatus: status ? status : { $exists: true } },
        ],
      } as any;

      if (search && search !== 'undefined') {
        query.$and.push({
          $or: [
            {
              _id: {
                $regex: search,
              },
            },
            {
              orderNumber: Number(search),
            },
            {
              orderNumber: {
                $regex: search,
              },
            },
            {
              'contact.email': {
                $regex: search,
              },
            },
          ],
        });
      }

      if (dateFromYear && dateFromMonth && dateFromDay) {
        query.$and.push({
          'payment.date': {
            $gte: new Date(dateFromYear, dateFromMonth, dateFromDay, 0, 0, 0, 0),
          },
        });
      }
      if (dateToYear && dateToMonth && dateToDay) {
        query.$and.push({
          'payment.date': {
            $lt: new Date(dateToYear, dateToMonth, dateToDay, 0, 0, 0, 0),
          },
        });
      }

      if (origin) {
        query.$and.push({
          fromPos: { $exists: origin === 'pos' },
        });
      }

      //TODO Some reason unwind is limiting results/

      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $project: {
                member: 0,
                stripe: 0,
              },
            },
            {
              $skip: parseInt(limit) * parseInt(currentPage),
            },
            {
              $limit: parseInt(limit),
            },
          ])
          .toArray(),
        db.collection('orders').countDocuments(query),
      ]).then(([orders, total = 0]) => {
        const contactIds = orders.map(o => o.contact?._id);
        return queryDocuments('contacts', { filter: { _id: { $in: contactIds } } }).then(
          contacts => {
            return {
              orders: orders.map(order => {
                const _contactId = order?.contact?._id;
                const _contact = contacts.find(c => c._id === _contactId);
                return {
                  ...order,
                  contact: {
                    _id: order?.contact?._id,
                    firstName: _contact?.firstName,
                    lastName: _contact?.lastName,
                    email: order?.contact?.email,
                  },
                };
              }),
              total,
            };
          }
        );
      });
    });
  },
};

export default Secure(listOrders);
