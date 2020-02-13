const assert = require('assert');
const { filter, map, find } = require('lodash');

// Whppt Config
const { bookEasy } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $axios, $mongo: { $db } }) {
    const { apiUrl, apiKey, vcid } = bookEasy;

    assert(apiUrl, 'Please provide an Book Easy API URL.');
    assert(vcid, 'Please provide an Book Easy VCID.');

    return $db
      .collection('listings')
      .find({ 'atdw.externalSystems.externalSystemCode': 'BOOKEASY' })
      .toArray()
      .then(listings => {
        assert(listings, 'No listings found with BookEasy Operator Id.');

        const operators = [];

        listings.forEach(listing => {
          const bookEasyEntry = getBookEasyFromListing(listing);
          operators.push(bookEasyEntry.externalSystemText);
        });

        const operatorIds = operators.join(',');

        return $axios
          .$get(`https://${apiUrl}/api/getOperatorsInformation?q=${vcid}&operators=${operatorIds}`)
          .then(({ Operators }) => {
            const listingsToUpdate = filter(listings, l => getBookEasyFromListing(l).externalSystemCode === 'BOOKEASY');

            const listingsWithBookEasy = map(listingsToUpdate, listingToUpdate => {
              const bookEasy = find(Operators, op => {
                const listing = getBookEasyFromListing(listingToUpdate);
                return op.OperatorID === Number(listing.externalSystemText);
              });
              if (!bookEasy) return listingToUpdate;
              return { ...listingToUpdate, bookEasy };
            });

            const ops = [];

            listingsWithBookEasy.forEach(listing => {
              ops.push({
                updateOne: {
                  filter: { _id: listing._id },
                  update: { $set: listing },
                },
              });
            });

            return $db
              .collection('listings')
              .bulkWrite(ops, { ordered: false })
              .then(() => {
                return Promise.resolve({ statusCode: 200, message: 'OK' });
              })
              .catch(e => {
                console.error(e);
              });
          })
          .catch(err => {
            throw new Error(err.message);
          });
      });
  },
};

function getBookEasyFromListing(listing) {
  return find(listing.atdw.externalSystems, ex => ex.externalSystemCode === 'BOOKEASY');
}
