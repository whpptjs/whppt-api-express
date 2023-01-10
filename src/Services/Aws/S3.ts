import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { HostingConfig, StorageHostingConfig } from '../Hosting';
import { StorageService } from '../Storage';

export type S3Constructor = ($hosting: Promise<HostingConfig>) => StorageService;

export const S3: S3Constructor = $hosting => {
  const clients: { [key: string]: S3Client } = {};

  const getClient = (apiKey: string, config: StorageHostingConfig) => {
    const client = clients[apiKey];
    if (client) return client;

    const region = config.aws?.region;
    const accessKeyId = config.aws?.accessKeyId;
    const secretAccessKey = config.aws?.secretAccessKey;
    if (!region) throw new Error('AWS Region is required');
    if (!accessKeyId) throw new Error('AWS access key id is required');
    if (!secretAccessKey) throw new Error('AWS secret access key is required');

    const newClient = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    clients[apiKey] = newClient;
    return newClient;
  };

  const upload = (path: string, fileBuffer: Buffer, meta: any = {}) => {
    return $hosting.then(({ storage, apiKey }) => {
      const bucketName = storage.aws?.bucket;
      if (!bucketName) return Promise.reject('S3 bucket name is required.');
      const s3Client = getClient(apiKey, storage);

      return s3Client
        .send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: path,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            Metadata: meta,
          })
        )
        .then(() => {})
        .catch(err => {
          throw new Error(err?.message || 'Uploading image failed.');
        });
    });
  };

  const remove = (path: string) => {
    return $hosting.then(({ storage, apiKey }) => {
      const bucketName = storage.aws?.bucket;
      if (!bucketName) return Promise.reject('S3 bucket name is required.');
      const s3Client = getClient(apiKey, storage);

      return s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: path,
          })
        )
        .then(() => {})
        .catch(err => {
          throw new Error(err?.message || 'Removing image failed.');
        });
    });
  };

  type StreamToBuffer = (stream: any) => Promise<Buffer>;
  const streamToBuffer: StreamToBuffer = (stream: any) =>
    new Promise((resolve, reject) => {
      const chunks: any = [];
      stream.on('data', (chunk: any) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

  const fetch = (path: string) => {
    return $hosting.then(({ storage, apiKey }) => {
      const bucketName = storage.aws?.bucket;

      if (!bucketName) return Promise.reject('S3 bucket name is required.');
      const s3Client = getClient(apiKey, storage);

      return s3Client
        .send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: path,
          })
        )
        .then(fileData => {
          if (!fileData || !fileData.Body) throw new Error('No file body');
          return streamToBuffer(fileData.Body);
        })
        .catch(err => {
          throw new Error(err?.message || 'Fetching image failed.');
        });
    });
  };

  return {
    upload(fileBuffer: Buffer, id: string, type: string, meta: any) {
      const path = type ? `${type}/${id}` : id;
      return upload(path, fileBuffer, meta);
    },

    remove(id: string, type: string) {
      return remove(`${type}/${id}`);
    },

    fetch(id: string, type: string) {
      return fetch(`${type}/${id}`);
    },

    uploadImage(fileBuffer: Buffer, id: string, meta: any) {
      return upload(`images/${id}`, fileBuffer, meta);
    },

    uploadDoc(fileBuffer: Buffer, id: string, meta: any) {
      return upload(`docs/${id}`, fileBuffer, meta);
    },

    fetchImage(id: string) {
      return fetch(`images/${id}`);
    },

    fetchDoc(id: string) {
      return fetch(`docs/${id}`);
    },

    removeImage(id: string) {
      return remove(`images/${id}`);
    },

    removeDoc(id: string) {
      return remove(`docs/${id}`);
    },
  };
};
