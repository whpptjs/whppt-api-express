declare module 'express-promise-json-router' {
  import { Router } from 'express';

  const JsonPromiseRouter: () => Router;
  export = JsonPromiseRouter;
}
