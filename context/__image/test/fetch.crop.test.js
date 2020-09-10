const test = require('ava');
const $logger = require('../../logger');
const Image = require('../index');
const fs = require('fs');
const Rembrandt = require('rembrandt');

test('fetch with crop', t => {
  const collection = function() {
    return {
      findOne: function() {
        return { type: 'image/jpg' };
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const expectedBuffer = fs.readFileSync(__dirname + '/ROAD-Cover-Cropped.jpg');
  const $mongo = { $db: { collection } };
  const $aws = { fetchImageFromS3: () => ({ imageBuffer }) };
  const image = Image({ $logger, $mongo, $aws });
  return image.fetch({ format: 'w_2000|h_1000|x_400|y_700|s_0.7|x_-20.23|y_-20.89', id: '53ok6uakbla' }).then(response => {
    // fs.writeFileSync(__dirname + '/ROAD-Cover-Cropped.jpg', response.Body);
    t.is('image/jpeg', response.ContentType);
    // t.is(response.Body.length, expectedBuffer.length, 'Invalid Image');
    const rembrandt = new Rembrandt({
      imageA: expectedBuffer,
      imageB: response.Body,
      // Needs to be one of Rembrandt.THRESHOLD_PERCENT or Rembrandt.THRESHOLD_PIXELS
      thresholdType: Rembrandt.THRESHOLD_PIXELS,
      maxThreshold: 0.01,
      maxDelta: 0.02,
      maxOffset: 0,
      renderComposition: true,
      compositionMaskColor: Rembrandt.Color.RED,
    });

    // Run the comparison
    return rembrandt.compare().then(function(result) {
      t.truthy(result.passed, 'Invalid Image Conversion');
      if (!result.passed) {
        fs.writeFileSync(__dirname + '/ROAD-Cover-Cropped-Diff.jpg', result.compositionImage);
      }
    });
  });
});
