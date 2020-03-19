const EmailSyntax = require('email-syntax').EmailSyntax;

module.exports = {
  exec({ $mongo: { $fetch, $save }, $email, $id }, { to, subject, data, content, storeAt }) {
    return $fetch('site', 'siteSettings').then(res => {
      const local = res.emailLocal || 'no-reply';
      if (!EmailSyntax.validateLocalPart(local)) throw new Error("Email address's local part is invalid.");
      let domain = '';
      return $email.getDomainList.then(domainList => {
        domain = res.emailLocal || domainList[0];
        if (!EmailSyntax.validateDomainName(domain)) throw new Error("Email address's domain name is invalid.");
        const from = `${local}@${domain}`;
        return $email.send({ from, to, subject, html: content }).then(() => {
          return $save(storeAt, {
            _id: $id(),
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
