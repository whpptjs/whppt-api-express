const { EmailSyntax } = require('email-syntax');

module.exports = {
  exec({ $mongo: { $fetch, $save }, $email, $id }, { to, subject, data, content, storeAt }) {
    return $fetch('site', 'siteSettings').then(res => {
      const local = res.emailLocal || 'no-reply';

      if (!EmailSyntax.validateLocalPart(local)) throw new Error("Email address's local part is invalid.");

      let domain = '';

      return $email.getDomainList().then(domainList => {
        domain = res.emailDomain || domainList[0];

        if (!EmailSyntax.validateDomainName(domain)) throw new Error("Email address's domain name is invalid.");

        const from = `${local}@${domain}`;

        return $email.send({ from, to, subject, html: content }).then(() => {
          const _id = $id();

          return $save(storeAt, {
            _id,
            subject,
            data: data || content,
            to,
            sentOn: new Date(),
          });
        });
      });
    });
  },
};
