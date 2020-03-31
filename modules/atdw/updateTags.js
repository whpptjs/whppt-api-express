const { forEach } = require('lodash');

module.exports = {
    exec({ $mongo: { $save, $db } }) {
        return Promise.all([$db.collection('site').findOne({_id: 'tags'}),$db.collection('listings').find({'listingType': 'product'}).toArray() ]).then(([tags, listings]) => {
            console.log("exec -> tags", tags)
            tags = tags || {_id: 'tags'}
            forEach(listings, listing => {
                tags[listing.atdw.productCategoryId] = listing.atdw.productCategoryDescription
                forEach(listing.atdw.verticalClassifications, productTag => {
                    tags[productTag.productTypeId] = productTag.productTypeDescription
                })
            })
            return $save('site', tags).then(() => {
                Promise.resolve({ status: 200, message: 'ATDW Tags updated' })
            })
        })
    }
}