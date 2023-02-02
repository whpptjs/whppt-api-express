import { getContactTemplate } from './contactTemplate';
import { getOrderTemplate } from './emailReceipt';
import { headers } from './layoutTemplates';
import { resetPasswordTemplate } from './passwordResetEmail';

type EmailTemplates = {
  [val: string]: any;
};

export const Templates: EmailTemplates = {
  HentleyFarm: {
    headers,
    getOrderTemplate,
    resetPasswordTemplate,
    getContactTemplate,
  },
};
