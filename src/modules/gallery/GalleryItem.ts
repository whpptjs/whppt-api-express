import { DataDocument } from '../DataDocument';
import { DomainDocument } from '../DomainDocument';

export type GalleryItem = DataDocument &
  DomainDocument & {
    defaultAltText?: string;
  };
