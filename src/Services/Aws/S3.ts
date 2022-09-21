import aws from 'aws-sdk';
import { StorageService } from '../Storage';

const S3_BUCKET_NAME = process.env.S3_BUCKET;

export type S3Constructor = () => StorageService;

export const S3: S3Constructor = () => {
  const s3 = new aws.S3();

  return {
    upload(fileBuffer: Buffer, id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.putObject(
          {
            Bucket: S3_BUCKET_NAME,
            Key: `gallery/${id}`,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentEncoding: 'base64',
          },
          err => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    },

    remove(id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket: S3_BUCKET_NAME, Key: `gallery/${id}` }, err => {
          if (err) return reject(err);
          resolve();
        });
      });
    },

    fetch(id: string) {
      console.log('🚀 ~ file: S3.ts ~ line 42 ~ fetch ~ id', id);
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.getObject(
          { Bucket: S3_BUCKET_NAME, Key: `gallery/${id}` },
          (err, fileData) => {
            if (err) return reject(err);
            if (!fileData || !fileData.Body) return reject(new Error('No file body'));
            resolve({ fileBuffer: fileData.Body as any });
          }
        );
      });
    },

    uploadImage(fileBuffer: Buffer, id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.putObject(
          {
            Bucket: S3_BUCKET_NAME,
            Key: `images/${id}`,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentEncoding: 'base64',
          },
          err => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    },

    uploadDoc(fileBuffer: Buffer, id: string, meta: any) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.putObject(
          {
            Bucket: S3_BUCKET_NAME,
            Key: `docs/${id}`,
            Body: fileBuffer,
            Metadata: meta,
            ContentEncoding: 'base64',
          },
          err => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    },

    fetchImage(id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.getObject(
          { Bucket: S3_BUCKET_NAME, Key: `images/${id}` },
          (err, imageData) => {
            if (err) return reject(err);
            if (!imageData || !imageData.Body) return reject(new Error('No image body'));
            resolve({ imageBuffer: imageData.Body as any });
          }
        );
      });
    },

    fetchDoc(id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.getObject({ Bucket: S3_BUCKET_NAME, Key: `docs/${id}` }, (err, docData) => {
          if (err) return reject(err);
          if (!docData || !docData.Body) return reject(new Error('No document body'));
          resolve({ imageBuffer: docData.Body as any });
        });
      });
    },

    removeImage(id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket: S3_BUCKET_NAME, Key: `images/${id}` }, err => {
          if (err) return reject(err);
          resolve();
        });
      });
    },

    removeDoc(id: string) {
      if (!S3_BUCKET_NAME) return Promise.reject('S3 bucket name is required.');
      return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket: S3_BUCKET_NAME, Key: `docs/${id}` }, err => {
          if (err) return reject(err);
          resolve();
        });
      });
    },
  };
};
