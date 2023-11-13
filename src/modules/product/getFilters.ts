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
        queryDistinct('products', { distinct: 'customFields.varietal' }).then(styles => {
          return styles.sort();
        }),
        queryDistinct('products', { distinct: 'customFields.vintage' }).then(vintages => {
          return vintages.sort().reverse();
        }),
        queryDistinct('products', { distinct: 'customFields.filterName' }).then(
          filterNames => {
            return filterNames.sort().reverse();
          }
        ),
      ]).then(([collections, styles, vintages, filterNames]) => {
        return { collections, styles, vintages, filterNames };
      });
    });
  },
};
export default getFilters;
