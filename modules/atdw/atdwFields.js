const { find, get, map } = require('lodash');
const { parse } = require('uri-js');

const stringFromPath = function(product, path) {
  return get(product, path);
};

module.exports = {
  name: stringFromPath,
  description: stringFromPath,
  activeStatus: stringFromPath,
  email(product, path) {
    if (path !== 'email') return stringFromPath(product, path);
    const email = find(product.communication, comm => comm.attributeIdCommunication === 'CAEMENQUIR');
    if (!email) return '';
    return email.communicationDetail;
  },
  phone(product, path) {
    if (path !== 'phone') return stringFromPath(product, path);
    const phone = find(product.communication, comm => comm.attributeIdCommunication === 'CAPHENQUIR');
    if (!phone) return '';
    return phone.communicationDetail;
  },
  physicalAddress(product, path) {
    if (path !== 'physicalAddress') return stringFromPath(product, path);
    const address = find(product.addresses, address => address.attributeIdAddress === 'PHYSICAL' || address.address_type === 'PHYSICAL');
    if (!address) return '';
    return `${address.addressLine1 || address.address_line || ''}${address.addressLine1 || address.address_line ? ',' : ''} ${address.cityName ||
      address.city}, ${address.stateName || address.state}, ${address.countryName || address.country}`;
  },
  postalAddress(product, path) {
    if (path !== 'postalAddress') return stringFromPath(product, path);
    const address = find(product.addresses, address => address.attributeIdAddress === 'POSTAL' || address.address_type === 'POSTAL');
    if (!address) return '';
    return `${address.addressLine1 || address.address_line || ''}${address.addressLine1 || address.address_line ? ',' : ''} ${address.cityName ||
      address.city}, ${address.stateName || address.state}, ${address.countryName || address.country}`;
  },
  image(product, propertyPath) {
    if (propertyPath !== 'productImage') return stringFromPath(product, propertyPath);
    if (!product.productImage) return;

    const { scheme, host, path } = parse(product.productImage);
    return `${scheme}://${host}${path}`;
  },
  atdwCategories(product) {
    const tags = map(product.verticalClassifications, category => category.productTypeId);
    tags.push(product.productCategoryId);
    return tags;
  },
};
