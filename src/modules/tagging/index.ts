import fetch from './fetch';
import filterList from './filterList';
import filterListSelected from './filterListSelected';
import save from './save';

export const tagging = (options: any[]) => ({
  fetch: fetch(options),
  filterList,
  filterListSelected,
  save: save(options),
});
