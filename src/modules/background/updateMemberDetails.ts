import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const updateMemberDetails: HttpModule<{ memberId: string }, any> = {
  exec({ $database, $salesForce }) {
    return $database.then(database => {
      const { db, document } = database as WhpptMongoDatabase;

      return db
        .collection('membersEvents')
        .find({ 'data._id': '194ilaq0m5sq' })
        .toArray()
        .then(memberEvents => {
          console.log(
            '🚀 ~ file: updateMemberDetails.ts:31 ~ exec ~ memberEvents',
            memberEvents
          );

          const promises = [] as any[];
          memberEvents.forEach(event => {
            switch (event.eventType) {
              case 'MemberCreated':
                promises.push(handleCreate(document, $salesForce, event));
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

const handleCreate = (document: any, $salesForce: any, event: any) => {
  event.processed = true;
  return $salesForce.$Oauth().then((token: string) => {
    // const _path = `Account/Consumer_External_ID__c/${event.data.contactId}`;
    const _path = `Account/Account_External_ID__c/${event.data.contactId}`;
    // return $salesForce.$upsert(token, event.data.contactId, {
    //   Name: 'item.name',
    //   ProductCode: 'item.productCode',
    //   Description: 'item.description',
    //   Family: 'item.family',
    //   StockKeepingUnit: 'item.customFields.stockKeepingUnit',
    //   QuantityUnitOfMeasure: 'item.customFields.quantityUnitOfMeasure',
    //   Varietal__c: 'item.customFields.varietal',
    //   Vintage__c: 'item.customFields.vintage',
    //   Bottle_Size__c: 'item.customFields.bottleSize',
    //   IsActive: 'item.isActive',
    // });

    return $salesForce
      .$patch(token, _path, {
        FirstName: 'Ben',
        LastName: 'Svelte',
      })
      .then(() => markEventAsProcessed(document, event));
  });
};

const markEventAsProcessed = (document: any, event: any) => {
  event.processed = true;
  return document.save('memberEvents', event);
};

export default updateMemberDetails;
