import { HttpModule } from '../HttpModule';

const getFilters: HttpModule<{
  collections: string[];
  styles: string[];
  vintages: string[];
}> = {
  exec({ $database }) {
    return $database.then(({ queryDistinct }) => {
      return Promise.all([
        queryDistinct('products', { distinct: 'family' }),
        queryDistinct('products', { distinct: 'style' }),
        queryDistinct('products', { distinct: 'customFields.vintage' }),
      ]).then(([collections, styles, vintages]) => {
        return { collections, styles, vintages };
      });
    });
  },
};
export default getFilters;
