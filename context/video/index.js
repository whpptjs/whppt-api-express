const pickFormat = function(format, accept, imageMeta) {
  // if (!format) return accept.indexOf('image/webp') !== -1 ? 'webp' : 'jpg';
  // if (format === 'orig') return imageMeta.type.split('/')[1];
  // return (imageType = format.f || imageMeta.type.split('/')[1] || 'jpg');
  return 'mp4';
};

module.exports = ({ $mongo: { $db, $dbPub }, $aws, $id, disablePublishing }) => {
  const fetch = function({ id }) {
    console.log('fetch -> id', id);
    return fetchOriginal({ id });
    // return $aws.fetchVideoFromS3(id).then(({ videoBuffer }) => {
    // const _sharpImage = Sharp(imageBuffer);
    // const _extractedImage =
    //   format.cx && format.cy && format.cw && format.ch
    //     ? _sharpImage.extract({ left: parseInt(format.cx), top: parseInt(format.cy), width: parseInt(format.cw), height: parseInt(format.ch) })
    //     : _sharpImage;
    // const _resizedImage =
    //   format.w && format.h
    //     ? _extractedImage.resize(parseInt(format.w), parseInt(format.h), {
    //         withoutEnlargement: true,
    //         // fit: Sharp.fit.inside,
    //       })
    //     : _extractedImage;

    // const imageType = pickFormat(format.f, accept, imageMeta);
    // const quality = parseInt(format.q) || 70;
    // const { img: optimisedImage, contentType } = optimise[imageType](_resizedImage, quality);

    // return optimisedImage.toBuffer().then(processedImageBuffer => {
    // return {
    //   Body: videoBuffer,
    //   ContentType: 'mp4',
    // };
    // });
    // });
  };

  const fetchOriginal = function({ id }) {
    // return $db
    //   .collection('images')
    //   .findOne({ _id: id })
    //   .then(storedImage => {
    return $aws.fetchVideoFromS3(id).then(({ videoBuffer }) => {
      const response = videoBuffer;
      response.Body = videoBuffer;
      response.ContentType = 'mp4';
      return response;
    });
    // });
  };

  return { fetchOriginal, fetch };
};
