const { find, get, map } = require('lodash');
const { parse } = require('uri-js');

const stringFromPath = function(product, path) {
  return get(product, path);
};

module.exports = {
  name: stringFromPath,
  description: stringFromPath,
  activeStatus: stringFromPath,
  email(product) {
    return find(product.communication, comm => comm.attributeIdCommunication === 'CAEMENQUIR');
  },
  physicalAddress(product) {
    return find(product.addresses, address => address.address_type === 'PHYSICAL');
  },
  postalAddress(product) {
    return find(product.addresses, address => address.address_type === 'POSTAL');
  },
  image(product) {
    if (!product.productImage) return;

    const { scheme, host, path } = parse(product.productImage);
    return `${scheme}://${host}${path}`;
  },
  atdwCategories(product) {
    const tags = map(product.verticalClassifications, category => category.productTypeId);
    tags.push(product.productCategoryId);
    return tags;
  },
  customCategories(product) {
    // this should just be same or []
    // hmmm....
  },
};
