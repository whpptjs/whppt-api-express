const { $uploadDocToS3, $fetchDocFromS3 } = require("../aws");

module.exports = () => {
  return { uploadDoc: $uploadDocToS3, fetchDoc: $fetchDocFromS3 };
};
