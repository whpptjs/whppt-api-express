import assert from 'assert';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const query: HttpModule<{ domainId: string; queryString: string }, any[]> = {
  exec({ $database, $hosting }, { domainId, queryString }) {
    if (!queryString || queryString === 'undefined') return Promise.resolve([]);
    let query = [] as any[];
    return $database.then(database => {
      return $hosting.then(({ searchIndex }) => {
        const { pubDb } = database as WhpptMongoDatabase;
        assert(pubDb, 'No Pub DB');

        if (domainId && domainId !== 'undefined')
          query.push({
            $match: {
              domainId,
            },
          });

        return pubDb
          .collection('search')
          .aggregate([
            {
              $search: {
                index: searchIndex,
                compound: {
                  should: [
                    {
                      text: {
                        query: queryString,
                        path: 'title',
                        score: {
                          boost: {
                            value: 10,
                          },
                        },
                      },
                    },
                    {
                      text: {
                        query: queryString,
                        path: 'tags',
                        score: {
                          boost: {
                            value: 5,
                          },
                        },
                      },
                    },
                    {
                      text: {
                        query: queryString,
                        path: 'description',
                      },
                    },
                  ],
                },
                highlight: {
                  path: 'title',
                },
              },
            },
            ...query,

            {
              $project: {
                highlight: {
                  $meta: 'searchHighlights',
                },
                title: 1,
                description: 1,
                tags: 1,
                slug: 1,
              },
            },
          ])
          .toArray();
      });
    });
  },
};
export default query;
