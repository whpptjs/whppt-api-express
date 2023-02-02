import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Templates } from './Templates';

export type ContactEmailContent = {
  firstName: string;
  email: string;
  lastName: string;
  phone?: string;
  reason: string;
  comments: string;
};

const sendContactEmail: HttpModule<
  {
    to: string;
    subject: string;
    data: string;
    content: ContactEmailContent;
    clientKey: string;
  },
  void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { to, subject, content, clientKey }) {
    assert(clientKey, 'Client key is required');
    assert(to, 'Email address is required');

    return context.$email.send({
      to,
      subject,
      html: Templates[clientKey].getContactTemplate(content),
    });
  },
};

export default sendContactEmail;
