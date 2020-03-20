const test = require('ava');
const sinon = require('sinon');
const objectRestMethods = require('./ObjectRestMethods');

test('something', t => {
  const books = [{ _id: 'book_1' }, { _id: 'book_2' }, { _id: 'book_3' }];
  const context = {
    $objectTypes: ['book'],
    $mongo: { $db: { $list: () => Promise.resolve(books) } },
  };
  const { list } = objectRestMethods(context);

  const params = { type: 'book' };
  return list({ params }).then(books => {
    t.is(books.length, 3);
    t.is(books[0]._id, 'book_1');
    t.is(books[1]._id, 'book_2');
    t.is(books[2]._id, 'book_3');
  });
});
