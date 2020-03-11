module.exports = {
  exec({ $mongo: { $db }, $email }, { to, subject, data, content, storeAt }) {
    return $email.send({ to, subject, html: content }).then(() => {
      return $db.collection(storeAt).insertOne({
        subject,
        data: data || content,
        to,
        sentOn: new Date(),
      });
    });
  },
};
