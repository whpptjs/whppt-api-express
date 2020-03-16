const test = require('ava');
const $logger = require('../../logger');
const Rembrandt = require('rembrandt');
const Image = require('../index');
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
      if (!result.passed) {
        console.log('Pixel Difference:', result.differences, 'Percentage Difference', result.percentageDifference, '%');
        fs.writeFileSync(__dirname + '/ROAD-Cover-Type-JPG-Diff.jpg', result.compositionImage);
      }
      t.truthy(result.passed, 'Invalid Image Conversion');
    });
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
      if (!result.passed) {
        console.log('Pixel Difference:', result.differences, 'Percentage Difference', result.percentageDifference, '%');
        fs.writeFileSync(__dirname + '/ROAD-Cover-Type-JPEG-Diff.jpg', result.compositionImage);
      }
      t.truthy(result.passed, 'Invalid Image Conversion');
    });
  });
});
