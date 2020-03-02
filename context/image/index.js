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

// TODO: Need to load image and get mime type to pass through middleware
module.exports = ({ $mongo: { $db }, $aws, $id }) => {
  const fetch = function({ format, id }) {
    const formatSplit = format.split('|');
    const mappedFormats = map(formatSplit, s => {
      const sp = s.split('_');
      return { type: sp[0], value: sp[1] };
    });

    const formats = keyBy(mappedFormats, s => s.type);

    const widthNum = formats.w.value === 'auto' ? Jimp.AUTO : Number(formats.w.value) || Jimp.AUTO;
    const heightNum = formats.h.value === 'auto' ? Jimp.AUTO : Number(formats.h.value) || Jimp.AUTO;

    const startX = Math.abs(Number(formats.x.value)) || 0;
    const startY = Math.abs(Number(formats.y.value)) || 0;

    const scale = Math.abs(Number(formats.s.value)) || 0.5;

    // const orientation = Number(formats.o.value) || Jimp.AUTO;

    return Promise.all([$db.collection('images').findOne({ _id: id }), $aws.fetchImageFromS3(id)]).then(([storedImage, s3Image]) => {
      const imageType = storedImage.type.split('/')[1];
      const { imageBuffer } = s3Image;

      const response = {};

      return Jimp.read(imageBuffer)
        .then(imgJimp => {
          return imgJimp
            .quality(70)
            .scale(scale)
            .crop(startX, startY, widthNum, heightNum)
            .getBufferAsync(supportedFormats[imageType]);
        })
        .then(processedImageBuffer => {
          response.Body = processedImageBuffer;
          response.ContentType = supportedFormats[imageType];
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

  return { upload, fetchOriginal, fetch, remove };
};
