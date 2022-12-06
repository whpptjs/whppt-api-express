import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const updateMemberDetails: HttpModule<{ memberId: string }, any> = {
  exec({ $database }) {
    return $database.then(database => {
      const { db, document } = database as WhpptMongoDatabase;

      return db
        .collection('membersEvents')
        .find({})
        .toArray()
        .then(memberEvents => {
          console.log(
            '🚀 ~ file: updateMemberDetails.ts:11 ~ returndb.collection ~ memberEvents',
            memberEvents
          );

          const promises = [] as any[];
          memberEvents.forEach(event => {
            switch (event.eventType) {
              case 'MemberCreated':
                // promises.push(handleSave(document, $salesforce, event));
                break;
              case 'MemberCreated':
                // code block
                break;
              default:
                markEventAsProcessed(document, event);
            }
          });

          return Promise.all(promises);
        });
    });
  },
};

// const handleSave = (document: any, $salesforce, event: any) => {
//   event.processed = true;
//   return $salesforce.$Oauth().then((token: string) => {
//     return $salesforce.$upsert(token, product._id, salesForceItem(product));
//   });
// };

const markEventAsProcessed = (document: any, event: any) => {
  event.processed = true;
  return document.save('memberEvents', event);
};

export default updateMemberDetails;
