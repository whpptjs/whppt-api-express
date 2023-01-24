import assert from 'assert';
import { HttpModule } from '../HttpModule';

const signUp: HttpModule<{ name: string; email: string }, any> = {
  exec({ $database }, { name, email }) {
    console.log('🚀 ~ file: signup.ts:6 ~ exec ~ $database', $database);
    assert(name, 'A name is required');
    assert(email, 'An email is required');
    return Promise.resolve({});

    // return $database.then(database => {

    // return document.query<Contact>('contacts', { filter: { _id: email } })).then(contact => {
    //   assert(contact, 'Could not find contact.');

    // const member = {
    //   _id: $id.newId(),
    //   contactId,
    // } as Member;

    // const memberEvents = [createEvent('MemberCreated', member)];

    // return startTransaction(session => {
    //   return document.saveWithEvents('members', member, memberEvents, { session });
    // }).then(() => member);
    // });
    // });
  },
};

export default signUp;
