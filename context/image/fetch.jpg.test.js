const test = require('ava');
const $logger = require('../logger');
// const $aws = require('../aws');
// const Mongo = require('../mongo');
const Image = require('./index');
var fs = require('fs');

test('fetch and format to jpg', t => {
  const collection = function() {
    return {
      findOne: function() {
        return { type: 'image/jpg' };
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const expectedBuffer = fs.readFileSync(__dirname + '/ROAD-Cover-Type.jpg');
  const $mongo = { $db: { collection } };
  const $aws = { fetchImageFromS3: () => ({ imageBuffer }) };
  const image = Image({ $logger, $mongo, $aws });
  return image.fetch({ format: 'w_2000|h_1000|x_400|y_700|s_0.9', id: '53ok6uakbla' }).then(response => {
    // fs.writeFileSync(__dirname + '/ROAD-Cover-Type.jpg', response.Body);
    t.is('image/jpeg', response.ContentType);
    t.is(response.Body.length, expectedBuffer.length, 'Invalid Image');
    // TODO: improve assertions
  });
});

test('fetch and format to jpeg', t => {
  const collection = function() {
    return {
      findOne: function() {
        return { type: 'image/jpg' };
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const expectedBuffer = fs.readFileSync(__dirname + '/ROAD-Cover-Type.jpeg');
  const $mongo = { $db: { collection } };
  const $aws = { fetchImageFromS3: () => ({ imageBuffer }) };
  const image = Image({ $logger, $mongo, $aws });
  return image.fetch({ format: 'w_2000|h_1000|x_400|y_700|s_0.9|f_jpeg', id: '53ok6uakbla' }).then(response => {
    // fs.writeFileSync(__dirname + '/ROAD-Cover-Type.jpeg', response.Body);
    t.is('image/jpeg', response.ContentType);
    t.is(response.Body.length, expectedBuffer.length, 'Invalid Image');
    // TODO: improve assertions
  });
});
