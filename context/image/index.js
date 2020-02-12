const Jimp = require('jimp');
// const CWebp = require('cwebp').CWebp;
// const sharp = require('sharp');
const { remove } = require('lodash');
const { $uploadImageToS3, $fetchImageFromS3 } = require('../aws');

// sharp.cache(false);

const supportedFormats = {
  png: Jimp.MIME_PNG,
  jpg: Jimp.MIME_JPEG,
  jpeg: Jimp.MIME_JPEG,
  tiff: Jimp.MIME_TIFF,
  gif: Jimp.MIME_GIF,
  auto: Jimp.AUTO,
};

// TODO: Add suport for webp to image formats
module.exports = ({ $logger, $mongo }) => {
  const fetch = function({ id, width, height, quality = 85, format = 'auto' }) {
    const mime = supportedFormats[format];
    return $fetchImageFromS3(id).then(({ imageBuffer }) => {
      const response = {};
      return Jimp.read(imageBuffer).then(imageJimp => {
        return imageJimp
          .resize(width, height)
          .quality(quality)
          .getBufferAsync(mime)
          .then(formatedImageBuffer => {
            response.Body = formatedImageBuffer;
            response.ContentType = mime;
            return response;
          });
      });
    });
  };

  // const fetchWebP = function({ id, width, height, quality = 85, format = 'auto' }) {
  //   // return fetch({ id, width, height, quality, format }).then(({ Body: imageBuffer }) => {
  //   return $fetchImageFromS3(id).then(({ imageBuffer }) => {
  //     const response = {};
  //     // const image = sharp(imageBuffer);
  //     return sharp(imageBuffer)
  //       .resize(width, height)
  //       .webp({ quality })
  //       .toBuffer()
  //       .then(function(webpImage) {
  //         response.Body = webpImage;
  //         response.ContentType = 'image/webp';
  //         return response;
  //       });
  //     // const encoder = new CWebp(imageBuffer);
  //     // encoder.quality(quality);
  //     // return encoder.toBuffer().then(function(buffer) {
  //     //   response.Body = buffer;
  //     //   response.ContentType = 'image/webp';
  //     //   return response;
  //     // });
  //   });
  // };

  const fetchOriginal = function({ id }) {
    return $mongo.then(({ db }) => {
      return db
        .collection('images')
        .findOne({ _id: id })
        .then(storedImage => {
          return $fetchImageFromS3(id).then(({ imageBuffer }) => {
            const response = imageBuffer;
            response.Body = imageBuffer;
            response.ContentType = storedImage.mime;
            return response;
          });
        });
    });
  };

  const updateImageUsage = function(aggType, agg, image, { db, saveDoc, session }) {
    const { imageKey, imageKeyDisplay, from, to } = image;
    return Promise.all([
      db
        .collection('images')
        .find({ _id: from }, {}, { session })
        .next(),
      db
        .collection('images')
        .find({ _id: to }, {}, { session })
        .next(),
    ]).then(([fromImage, toImage]) => {
      const saves = [];
      if (fromImage) {
        fromImage.uses = fromImage.uses || [];
        remove(fromImage.uses, u => u.aggId === agg._id && u.key === imageKey);
        saves.push(saveDoc('images', fromImage, { session }));
      }

      toImage.uses = toImage.uses || [];
      remove(toImage.uses, u => u.aggId === agg._id && u.key === imageKey);
      toImage.uses.push({
        aggId: agg._id,
        aggType,
        key: imageKey,
        imageKeyDisplay,
      });
      saves.push(saveDoc('images', toImage, { session }));

      return Promise.all(saves);
    });
  };

  return { upload: $uploadImageToS3, fetch, fetchOriginal, updateImageUsage };
};
