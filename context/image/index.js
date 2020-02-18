const Jimp = require('jimp');
const { map, keyBy } = require('lodash');

const supportedFormats = {
  png: Jimp.MIME_PNG,
  jpg: Jimp.MIME_JPEG,
  jpeg: Jimp.MIME_JPEG,
  tiff: Jimp.MIME_TIFF,
  gif: Jimp.MIME_GIF,
  auto: Jimp.AUTO,
};

// TODO: Add suport for webp to image formats
module.exports = ({ $logger, $mongo: { $db }, $aws, $id }) => {
  const fetch = function({ format, id }) {
    const formatSplit = format.split('|');
    const mappedFormats = map(formatSplit, s => {
      const sp = s.split('_');
      return { type: sp[0], value: sp[1] };
    });
    console.log('TCL: fetch -> mappedFormats', mappedFormats);
    const formats = keyBy(mappedFormats, s => s.type);
    const widthNum = formats.w.value === 'auto' ? Jimp.AUTO : Number(formats.w.value);
    const heightNum = formats.h.value === 'auto' ? Jimp.AUTO : Number(formats.h.value);
    const startX = Number(formats.x.value);
    const startY = Number(formats.y.value);
    const scale = Number(formats.s.value);
    const orientation = Number(formats.o.value);

    return $aws.fetchImageFromS3(id).then(({ imageBuffer }) => {
      const response = {};

      return Jimp.read(imageBuffer)
        .then(imgJimp => {
          return imgJimp
            .scale(scale)
            .crop(-startX, -startY, widthNum, heightNum)
            .getBufferAsync(Jimp.MIME_PNG);
        })
        .then(processedImageBuffer => {
          response.Body = processedImageBuffer;
          response.ContentType = Jimp.MIME_PNG;
          return response;
        });
    });
  };

  const fetchOriginal = function({ id }) {
    return $db
      .collection('images')
      .findOne({ _id: id })
      .then(storedImage => {
        return $aws.fetchImageFromS3(id).then(({ imageBuffer }) => {
          const response = imageBuffer;
          response.Body = imageBuffer;
          response.ContentType = storedImage.type;
          return response;
        });
      });
  };

  const upload = function(file) {
    const { buffer, mimetype: type, originalname: name } = file;
    const id = $id();
    // const data = new Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    return $aws.uploadImageToS3(buffer, id).then(() =>
      $db.collection('images').insertOne({
        _id: id,
        uploadedOn: new Date(),
        name,
        type,
      })
    );
  };

  const remove = function(id) {
    return $aws.removeImageFromS3(id).then(() =>
      $db.collection('images').deleteOne({
        id,
      })
    );
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
  return { upload, fetchOriginal, fetch, remove };
};
