const S3 = require('./s3');
const SES = require('./ses');

const { sendEmail, getDomainIdentities } = SES();

const {
  uploadImage: uploadImageToS3,
  fetchImage: fetchImageFromS3,
  fetchVideo: fetchVideoFromS3,
  uploadDoc: uploadDocToS3,
  fetchDoc: fetchDocFromS3,
  removeImage: removeImageFromS3,
  removeDoc: removeDocFromS3,
} = S3();

module.exports = { uploadImageToS3, fetchImageFromS3, fetchVideoFromS3, uploadDocToS3, fetchDocFromS3, removeImageFromS3, sendEmail, getDomainIdentities, removeDocFromS3 };
