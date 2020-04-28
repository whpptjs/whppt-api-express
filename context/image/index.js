const Sharp = require('sharp');
const { map, keyBy } = require('lodash');

const optimise = {
  jpg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  jpeg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  // png: (image, quality) => ({ contentType: 'image/png', img: image.png({ progressive: false, compressionLevel: 5 }) }),
  webp: (image, quality) => ({ contentType: 'image/webp', img: image.webp({ quality }) }),
};

module.exports = ({ $mongo: { $db }, $aws, $id }) => {
  const fetch = function({ format, id, accept = '' }) {
    const formatSplit = format.split('|');
    const mappedFormats = map(formatSplit, s => {
      const sp = s.split('_');
      return { type: sp[0], value: sp[1] };
    });

    const formats = keyBy(mappedFormats, s => s.type);

    const widthNum = formats.w.value === 'auto' ? Jimp.AUTO : Number(formats.w.value) || Jimp.AUTO;
    const heightNum = formats.h.value === 'auto' ? Jimp.AUTO : Number(formats.h.value) || Jimp.AUTO;

    return Promise.all([$db.collection('images').findOne({ _id: id }), $aws.fetchImageFromS3(id)]).then(([storedImage, s3Image]) => {
      const { imageBuffer } = s3Image;
      const image = Sharp(imageBuffer);
      return image.metadata().then(meta => {
        const startX = (formats.x && parseInt(Number(formats.x.value < 0 ? 0 : formats.x.value))) || 0;
        const startY = (formats.y && parseInt(Number(formats.y.value < 0 ? 0 : formats.y.value))) || 0;
        const scale = (formats.s && parseInt(Number(formats.s.value))) || 1;
        const blur = (formats.b && parseInt(Number(formats.b.value))) || undefined;

        const scaledWidth = meta.width * scale;
        const extractWidth = scaledWidth + startX > meta.width ? meta.width - startX : scaledWidth;
        const scaledHeight = meta.height * scale;
        const extractHeight = scaledHeight + startY > meta.height ? meta.height - startY : scaledHeight;
        // const scaledX = meta.width / 2 + startX;
        // const scaledY = meta.height / 2 + startY;
        let croppedImage = image.extract({ left: startX, top: startY, width: parseInt(extractWidth), height: parseInt(extractHeight) }).resize(widthNum, heightNum);
        if (blur) croppedImage = croppedImage.blur(blur);

        let imageType;
        if (formats.f) imageType = (formats.f && formats.f.value) || storedImage.type.split('/')[1] || 'jpg';
        else imageType = accept.indexOf('image/webp') !== -1 ? 'webp' : 'jpg';
        const quality = (formats.q && formats.q.value) || 70;
        const { img: optimisedImage, contentType } = optimise[imageType](croppedImage, quality);

        return optimisedImage.toBuffer().then(processedImageBuffer => {
          return {
            Body: processedImageBuffer,
            ContentType: contentType,
          };
        });
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

    const image = Sharp(buffer).resize({
      width: 2700,
      height: 2700,
      fit: Sharp.fit.inside,
    });

    return image.toBuffer().then(sizedBuffer => {
      return $aws.uploadImageToS3(sizedBuffer, id).then(() =>
        $db.collection('images').insertOne({
          _id: id,
          uploadedOn: new Date(),
          name,
          type,
        })
      );
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
