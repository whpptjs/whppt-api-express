const { parse } = require('uri-js');
const { forEach, uniqBy } = require('lodash');

module.exports = multimedia => {
  forEach(multimedia, media => {
    const url = parse(media.serverPath);
    media.serverPath = `${url.scheme}://${url.host}${url.path}`;
  });

  return uniqBy(multimedia, media => media.serverPath);
};
