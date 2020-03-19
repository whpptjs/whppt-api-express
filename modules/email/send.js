const EmailSyntax = require('email-syntax').EmailSyntax;

module.exports = {
  exec({ $mongo: { $fetch, $save }, $email, $id }, { to, subject, data, content, storeAt }) {
    return $fetch('site', 'siteSettings').then(res => {
      const localValid = false;
      const domainValid = false;
      try {
        localValid = EmailSyntax.validateLocalPart(res.emailLocal);
        domainValid = EmailSyntax.validateLocalPart(res.emailDomain);
        if (!localValid) throw new Error("Email address's local part is invalid.");
        if (!domainValid) throw new Error("Email address's domain name is invalid.");
      } catch (err) {
        throw new Error("Email address's local/domain part is invalid.");
      }

      const from = `${res.emailLocal}@${res.emailDomain}`;
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
  },
};
