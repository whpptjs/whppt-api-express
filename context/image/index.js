const Sharp = require('sharp');

const optimise = {
  jpg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  jpeg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  webp: (image, quality) => ({ contentType: 'image/webp', img: image.webp({ quality }) }),
};

const pickFormat = function(format, accept, imageMeta) {
  if (!format) return accept.indexOf('image/webp') !== -1 ? 'webp' : 'jpg';
  if (format === 'orig') return imageMeta.type.split('/')[1];

  return format.f || imageMeta.type.split('/')[1] || 'jpg';
};

module.exports = ({ $mongo: { $db, $dbPub }, $aws, $id, disablePublishing }) => {
  // Format options
  // { w: '666', h: '500', f: 'jpg', cx: '5', cy: '5', cw: '500', ch: '500', q: '70', o: 'true' }
  const fetch = function({ format, id, accept = '' }) {
    console.log(format);
    if (format.o) return fetchOriginal({ id });

    return Promise.all([$db.collection('images').findOne({ _id: id }), $aws.fetchImageFromS3(id)]).then(([imageMeta, { imageBuffer }]) => {
      const _sharpImage = Sharp(imageBuffer);

      let _extractedImage = _sharpImage;

      if (format.cx && format.cy && format.cw && format.ch) {
        _extractedImage = _sharpImage.extract({ left: parseInt(format.cx), top: parseInt(format.cy), width: parseInt(format.cw), height: parseInt(format.ch) });
      }

      const _resizedImage =
        format.w && format.h
          ? _extractedImage.resize(parseInt(format.w), parseInt(format.h), {
              withoutEnlargement: true,
            })
          : _extractedImage;

      const imageType = pickFormat(format.f, accept, imageMeta);
      const quality = parseInt(format.q) || 70;
      const { img: optimisedImage, contentType } = optimise[imageType](_resizedImage, quality);

      return optimisedImage.toBuffer().then(processedImageBuffer => {
        return {
          Body: processedImageBuffer,
          ContentType: contentType,
        };
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

    return $aws.uploadImageToS3(buffer, id).then(() => {
      const image = {
        _id: id,
        version: 'v2',
        uploadedOn: new Date(),
        name,
        type,
      };

      return $db
        .collection('images')
        .insertOne(image)
        .then(() => {
          if (disablePublishing) return Promise.resolve();

          return $dbPub.collection('images').insertOne({
            _id: id,
            version: 'v2',
            uploadedOn: new Date(),
            name,
            type,
          });
        })
        .then(() => image);
    });
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
