const test = require('ava');
const $logger = require('../../logger');
const Image = require('../index');
var fs = require('fs');

test('fetch and format to webp atuomatically based on browser', t => {
  const collection = function() {
    return {
      findOne: function() {
        return { type: 'image/jpg' };
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const expectedBuffer = fs.readFileSync(__dirname + '/ROAD-Cover-Type-Auto.webp');
  const $mongo = { $db: { collection } };
  const $aws = { fetchImageFromS3: () => ({ imageBuffer }) };
  const image = Image({ $logger, $mongo, $aws });
  return image.fetch({ format: 'w_2000|h_1000|x_400|y_700|s_0.9', id: '53ok6uakbla', accept: 'image/webp' }).then(response => {
    fs.writeFileSync(__dirname + '/ROAD-Cover-Type-Auto.webp', response.Body);
    t.is('image/webp', response.ContentType);
    t.is(response.Body.length, expectedBuffer.length, 'Invalid Image');
    // TODO: improve assertions
  });
});
