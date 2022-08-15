import fileType from 'file-type';
import { Service } from '../Context';
import { FetchImage } from './image';
import { FetchOriginal } from './FetchOriginal';
import { GalleryItem, GalleryItemType } from './GalleryItem';

export type Gallery = {
  upload: ({ file, domainId, type }: { file: any; domainId: string; type: GalleryItemType }) => Promise<GalleryItem>;
  fetchOriginal: FetchOriginal;
  fetchImage: FetchImage;
};

const gallery: Service<Gallery> = context => {
  const {
    $id,
    $aws,
    $mongo: { $startTransaction, $save },
  } = context;

  const fetchOriginal = FetchOriginal(context);
  const fetchImage = FetchImage(context, fetchOriginal);

  return {
    upload: ({ file, domainId, type }) => {
      const { buffer, mimetype, originalname } = file;
      return fileType.fromBuffer(buffer).then(fileType => {
        const newGalleryItem: GalleryItem = {
          _id: $id(),
          domainId,
          type,
          fileInfo: {
            originalname,
            ext: fileType?.ext,
            mime: fileType?.mime,
            type: mimetype,
          },
          tags: [],
          suggestedTags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          date: new Date(),
        };

        return $startTransaction(session => {
          return $save('gallery', newGalleryItem, { session }).then(() => $aws.uploadToS3(buffer, newGalleryItem._id));
        }).then(() => newGalleryItem);
      });
    },
    fetchOriginal,
    fetchImage,
  };
};

export default gallery;
