module.exports = {
  exec({ $mongo: { $db } }, { domain }) {
    return $db
      .collection('domains')
      .findOne({ hostnames: 'localhost' })
      .then(oldDomain => {
        domain.hostnames.push('localhost');
        domain.hostString = domain.hostnames.join(',');

        const promises = [$db.collection('domains').updateOne({ _id: domain._id }, { $set: domain })];

        if (oldDomain && oldDomain._id) {
          oldDomain.hostnames = oldDomain.hostnames.filter(item => item !== 'localhost');
          oldDomain.hostString = oldDomain.hostnames.join(',');
          promises.push($db.collection('domains').updateOne({ _id: oldDomain._id }, { $set: oldDomain }));
        }

        return Promise.all(promises).then(() => {
          return { newDomain: domain, oldDomain };
        });
      });
  },
};
