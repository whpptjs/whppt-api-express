import { ContextType } from '../../context/Context';

import { XeroClient } from 'xero-node';

// const xero = new XeroClient({
//   clientId: 'YOUR_CLIENT_ID',
//   clientSecret: 'YOUR_CLIENT_SECRET',
//   redirectUris: [`http://localhost:3000/callback`],
//   scopes: 'openid profile email accounting.transactions offline_access'.split(' '),
//   state: 'returnPage=my-sweet-dashboard', // custom params (optional)
//   httpTimeout: 3000, // ms (optional)
//   clockTolerance: 10, // seconds (optional)
// });

const xero = new XeroClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  grantType: 'client_credentials',
});

export type XeroService = (context: ContextType) => {
  getXeroTrackingDetails: () => Promise<string[]>;
};

export const Xero: XeroService = () => {
  return {
    getXeroTrackingDetails: async () => {
      const tokenSet = await xero.getClientCredentialsToken();
      console.log(
        '🚀 ~ file: index.ts:31 ~ getXeroTrackingDetails: ~ tokenSet:',
        tokenSet
      );
      //   res.redirect(consentUrl);
      return Promise.resolve(['d']);
    },
  };
};
