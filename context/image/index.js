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
          return (
            imgJimp
              .scale(scale)
              .crop(-startX, -startY, widthNum, heightNum)
              // TODO: Need to load image and get mime type to pass through middleware
              .getBufferAsync(Jimp.MIME_PNG)
          );
        })
        .then(processedImageBuffer => {
          response.Body = processedImageBuffer;
          // TODO: Need to load image and get mime type to pass through middleware
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
