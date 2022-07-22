import { DataDocument } from '../../modules/DataDocument';
import { DomainDocument } from '../../modules/DomainDocument';
import { FileExtension, MimeType } from 'file-type';

export type GalleryItemType = 'image' | 'video' | 'file' | 'lotty' | 'svg';
export type GalleryFileInfo = {
  originalname: string;
  ext?: FileExtension;
  mime?: MimeType;
  type: string;
};

export type GalleryItem = DataDocument &
  DomainDocument & {
    type: GalleryItemType;
    defaultAltText?: string;
    tags: string[];
    suggestedTags: string[];
    fileInfo?: GalleryFileInfo;
  };
