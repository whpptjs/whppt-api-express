import { HttpModule } from '../HttpModule';
import { Product } from './Models/Product';

export type ProductLoadFilters = {
  collection: string;
  style: string;
  vintage: string;
  sortBy: string;
  search?: string;
};

const load: HttpModule<{ productId: string }, Product> = {
  exec({ $database }, { productId }) {
    return $database.then(({ document }) => {
      return document.fetch('products', productId);
    });
  },
};

export default load;
