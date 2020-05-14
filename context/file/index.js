const { map, keyBy } = require('lodash');
const fileType = require('file-type');

module.exports = ({ $mongo: { $db, $dbPub, $startTransaction, $delete, $unpublish }, $aws, $id }) => {
  const upload = function(file, description) {
    const { buffer, mimetype: type, originalname: name } = file;
    const id = $id();
    const fi = fileType.fromBuffer(buffer);
    return fileType.fromBuffer(buffer).then(fType => {
      return $aws.uploadDocToS3(buffer, id).then(() => {
        return $db
          .collection('files')
          .insertOne({
            _id: id,
            uploadedOn: new Date(),
            name,
            type,
            fileType: fType,
            description,
          })
          .then(() => {
            $dbPub.collection('files').insertOne({
              _id: id,
              uploadedOn: new Date(),
              name,
              type,
              fileType: fType,
              description,
            });
          });
      });
    });
  };

  const remove = function(fileId) {
    return $startTransaction(session => {
      return $unpublish('files', fileId, { session }).then(() => {
        return $delete('files', fileId, { session }).then(() => {
          return $aws.removeDocFromS3(fileId);
        });
      });
    });
  };

  const fetchOriginal = function({ id }) {
    return $db
      .collection('files')
      .findOne({ _id: id })
      .then(storedImage => {
        return $aws.fetchDocFromS3(id).then(({ imageBuffer }) => {
          const response = imageBuffer;
          response.Body = imageBuffer;
          response.ContentType = storedImage.type;
          return response;
        });
      });
  };

  return { upload, remove, fetchOriginal };
};
