const awsSDK_S3 = require('aws-sdk');
const awsSDK_SES = require('aws-sdk');
const S3 = require('./s3');
const SES = require('./ses');

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';

awsSDK_S3.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

awsSDK_SES.config.update({
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const {
  uploadImage: uploadImageToS3,
  fetchImage: fetchImageFromS3,
  fetchVideo: fetchVideoFromS3,
  uploadDoc: uploadDocToS3,
  fetchDoc: fetchDocFromS3,
  removeImage: removeImageFromS3,
  removeDoc: removeDocFromS3,
} = S3(awsSDK_S3);

const { sendEmail, getDomainIdentities } = SES(awsSDK_SES);

module.exports = { uploadImageToS3, fetchImageFromS3, fetchVideoFromS3, uploadDocToS3, fetchDocFromS3, removeImageFromS3, sendEmail, getDomainIdentities, removeDocFromS3 };
