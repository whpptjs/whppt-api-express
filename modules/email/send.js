const EmailSyntax = require('email-syntax').EmailSyntax;

module.exports = {
  exec({ $mongo: { $fetch }, $email }, { to, subject, data, content, storeAt }) {
    return $fetch('site', 'siteSettings').then(res => {
      if (!EmailSyntax.validateLocalPart(res.emailLocal)) throw new Error("Email address's local part is invalid.");
      if (!EmailSyntax.validateDomainName(res.emailDomain)) throw new Error("Email address's domain name is invalid.");
      const from = `${res.emailLocal}@${res.domain}`;
      return $email.send({ from, to, subject, html: content }).then(() => {
        return $db.collection(storeAt).insertOne({
          subject,
          data: data || content,
          to,
          sentOn: new Date(),
        });
      });
    });
  },
};
