export type PageType = {
  key?: string;
  name: string;
  label: string;
  collection?: { name: string };
};

export const genericPageType: PageType = {
  name: 'page',
  label: 'Generic',
  collection: { name: 'pages' },
};
