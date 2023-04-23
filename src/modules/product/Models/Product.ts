import { WhpptImageData } from '../../../modules/image/Models';

export type WhpptProductImageData = WhpptImageData & { _id: string };

export type Product = {
  _id: string;
  domainId: string;
  name: string;
  productCode: string;
  description?: string;
  family?: string;
  quantityAvailable?: string;
  canPlaceOrderQuantity?: string;
  unitOfMeasure?: string;
  price?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  featureImageId?: string;
  images: WhpptProductImageData[];
  config?: {
    [key: string]: any;
  };
  customFields: {
    [key: string]: string | any | undefined;
  };
  freeDelivery?: boolean;
};
