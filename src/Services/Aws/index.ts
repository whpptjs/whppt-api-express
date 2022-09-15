import aws from 'aws-sdk';
import { S3 } from './S3';
import { SES } from './SES';

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';

aws.config.update({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

export const $s3 = S3();
export const $ses = SES();

// module.exports = {
//   uploadToS3,
//   removeFromS3,
//   fetchFromS3,
//   uploadImageToS3,
//   fetchImageFromS3,
//   uploadDocToS3,
//   fetchDocFromS3,
//   removeImageFromS3,
//   sendEmail,
//   getDomainIdentities,
//   removeDocFromS3,
// };
