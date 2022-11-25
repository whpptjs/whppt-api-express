import { HttpModule } from '../HttpModule';
import { Staff } from './Model';

const list: HttpModule<
  {
    limit: string;
    currentPage: string;
    search: string;
  },
  { staff: Staff[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { limit, currentPage, search }) {
    let query = {} as any;

    if (search) query.name = { $regex: search, $options: 'i' };

    return $database.then(({ queryDocuments, countDocuments }) => {
      return Promise.all([
        queryDocuments<Staff>('staff', {
          filter: query,
          limit: parseInt(limit),
          skip: parseInt(limit) * parseInt(currentPage),
        }),
        countDocuments('staff', { filter: query }),
      ]).then(([staff, total]) => {
        return { staff, total };
      });
    });
  },
};
export default list;
