import { ContextType } from '../../context/Context';

import { XeroClient } from 'xero-node';

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  grantType: 'client_credentials',
});

export type XeroService = (context: ContextType) => {
  getXeroTrackingDetails: () => Promise<{
    salesGroups: string[];
    salesPersons: string[];
  }>;
};

export const Xero: XeroService = () => {
  return {
    getXeroTrackingDetails: async () => {
      const salesGroups = [];
      const salesPersons = [];
      try {
        await xero.getClientCredentialsToken();
        const { body } = (await xero.accountingApi.getTrackingCategories(
          process.env.XERO_TENANT_ID || ''
        )) as any;
        const _salesGroups = body.trackingCategories.find(
          (tc: any) => tc.name === 'Sales Group'
        );
        const _salesPersons = body.trackingCategories.find(
          (tc: any) => tc.name === 'Sales Person'
        );
        salesGroups.push(
          ...(_salesGroups?.options.filter((sg: any) => sg.status === 'ACTIVE') || [])
        );
        salesPersons.push(
          ...(_salesPersons?.options.filter((sp: any) => sp.status === 'ACTIVE') || [])
        );
        return {
          salesGroups: salesGroups.map(sg => sg.name),
          salesPersons: salesPersons.map(sg => sg.name),
        };
      } catch (err) {
        throw err;
      }
    },
  };
};
