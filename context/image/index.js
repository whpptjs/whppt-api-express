const Jimp = require('jimp');

const { remove } = require('lodash');

const supportedFormats = {
  png: Jimp.MIME_PNG,
  jpg: Jimp.MIME_JPEG,
  jpeg: Jimp.MIME_JPEG,
  tiff: Jimp.MIME_TIFF,
  gif: Jimp.MIME_GIF,
  auto: Jimp.AUTO,
};

// TODO: Add suport for webp to image formats
module.exports = ({ $logger, $mongo, $aws }) => {
  // const fetch = function({ id, width, height, quality = 85, format = 'auto' }) {
  //   const mime = supportedFormats[format];
  //   return $fetchImageFromS3(id).then(({ imageBuffer }) => {
  //     const response = {};
  //     return Jimp.read(imageBuffer).then(imageJimp => {
  //       return imageJimp
  //         .resize(width, height)
  //         .quality(quality)
  //         .getBufferAsync(mime)
  //         .then(formatedImageBuffer => {
  //           response.Body = formatedImageBuffer;
  //           response.ContentType = mime;
  //           return response;
  //         });
  //     });
  //   });
  // };

  const fetchOriginal = function({ id }) {
    return $mongo.then(({ db }) => {
      return db
        .collection('images')
        .findOne({ _id: id })
        .then(storedImage => {
          return $aws.fetchImageFromS3(id).then(({ imageBuffer }) => {
            const response = imageBuffer;
            response.Body = imageBuffer;
            response.ContentType = storedImage.mime;
            return response;
          });
        });
    });
  };

  // const updateImageUsage = function(aggType, agg, image, { db, saveDoc, session }) {
  //   const { imageKey, imageKeyDisplay, from, to } = image;
  //   return Promise.all([
  //     db
  //       .collection('images')
  //       .find({ _id: from }, {}, { session })
  //       .next(),
  //     db
  //       .collection('images')
  //       .find({ _id: to }, {}, { session })
  //       .next(),
  //   ]).then(([fromImage, toImage]) => {
  //     const saves = [];
  //     if (fromImage) {
  //       fromImage.uses = fromImage.uses || [];
  //       remove(fromImage.uses, u => u.aggId === agg._id && u.key === imageKey);
  //       saves.push(saveDoc('images', fromImage, { session }));
  //     }

  //     toImage.uses = toImage.uses || [];
  //     remove(toImage.uses, u => u.aggId === agg._id && u.key === imageKey);
  //     toImage.uses.push({
  //       aggId: agg._id,
  //       aggType,
  //       key: imageKey,
  //       imageKeyDisplay,
  //     });
  //     saves.push(saveDoc('images', toImage, { session }));

  //     return Promise.all(saves);
  //   });
  // };

  // return { upload: $uploadImageToS3, fetch, fetchOriginal, updateImageUsage };
  return { upload: $aws.uploadImageToS3, fetchOriginal };
};
