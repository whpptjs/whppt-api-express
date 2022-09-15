import uniqid from 'uniqid';

export type IdService = { newId: () => string };
export type IdServiceConstructor = () => IdService;

export const IdService: IdServiceConstructor = () => ({ newId: () => uniqid.process() });
