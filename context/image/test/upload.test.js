const test = require('ava');
const $logger = require('../../logger');
const Image = require('../index');
var fs = require('fs');

test('upload should resize to max size', t => {
  const collection = function() {
    return {
      insertOne: function(imageRecord) {
        t.is(imageRecord._id, 'testId');
        t.truthy(imageRecord.uploadedOn);
        t.is(imageRecord.name, 'ROAD-Cover.jpg');
        t.is(imageRecord.type, 'image/jpg');
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const expectedBuffer = fs.readFileSync(__dirname + '/ROAD-Cover-Upload.jpg');
  const $mongo = { $db: { collection } };
  const $aws = {
    uploadImageToS3: (buffer, id) => {
      // fs.writeFileSync(__dirname + '/ROAD-Cover-Upload.jpg', buffer);
      t.is(buffer.length, expectedBuffer.length);
      // TODO: Improve assertions
      t.is(id, 'testId');
      return Promise.resolve();
    },
  };
  const image = Image({ $logger, $mongo, $aws, $id: () => 'testId' });

  const file = { buffer: imageBuffer, mimetype: 'image/jpg', originalname: 'ROAD-Cover.jpg' };
  return image.upload(file);
});
