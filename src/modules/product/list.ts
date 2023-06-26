import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';
import { Db } from 'mongodb';

const list: HttpModule<
  {
    domainId: string;
    limit: string;
    currentPage: string;
    search: string;
    statusFilter: string;
    sellableFilter: string;
    family: string;
    vintage: string;
  },
  { products: Product[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec(
    { $database },
    {
      domainId,
      limit,
      currentPage,
      search,
      family,
      statusFilter,
      sellableFilter,
      vintage,
    }
  ) {
    let query = {
      domainId,
    } as any;

    if (statusFilter) query.isActive = statusFilter === 'active' ? true : false;
    if (sellableFilter === 'pos') query.forSaleOnPos = true;
    if (sellableFilter === 'website') query.forSaleOnWebsite = true;
    if (family) query.family = family;
    if (vintage) query['customFields.vintage'] = vintage;
    if (search)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
      ];

    return ($database as Promise<WhpptMongoDatabase>).then(
      ({ pubDb, countDocuments }) => {
        return Promise.all([
          queryDocuments(pubDb, {
            filter: query,
            limit: parseInt(limit),
            skip: parseInt(limit) * parseInt(currentPage),
          }),
          countDocuments('products', { filter: query }),
        ]).then(([products, total]) => {
          return { products, total };
        });
      }
    );
  },
};
export default list;

const queryDocuments: any = (
  pubDb: Db,
  query: {
    filter: { [key: string]: any };
    projection?: { [key: string]: any };
    limit?: number;
    skip?: number;
    sort?: { [key: string]: any };
  },
  options = {}
) => {
  let _query = pubDb.collection('products').find<Product>(query.filter, options);
  if (query.projection) _query = _query.project(query.projection);
  if (query.sort) _query = _query.sort(query.sort);
  if (query.limit) _query = _query.limit(query.limit);
  if (query.skip) _query = _query.skip(query.skip);

  return _query.toArray();
};
