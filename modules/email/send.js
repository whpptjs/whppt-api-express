module.exports = {
  exec({ $mongo: { $db }, $email }, { to, subject, content, storeAt }) {
    return $email.send({ to, subject, html: content }).then(() => {
      return $db.collection(storeAt).insertOne({
        subject,
        content,
        to,
        createdAt: new Date(),
      });
    });
  },
};
