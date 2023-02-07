import { getContactTemplate } from './contactTemplate';
import { getOrderTemplate } from './emailReceipt';
import { headers } from './headers';
import { footer } from './footer';
import { resetPasswordTemplate } from './passwordResetEmail';

type EmailTemplates = {
  [val: string]: any;
};

export const Templates: EmailTemplates = {
  HentleyFarm: {
    headers,
    footer,
    getOrderTemplate,
    resetPasswordTemplate,
    getContactTemplate,
  },
};
