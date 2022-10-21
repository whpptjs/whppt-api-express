import assert from 'assert';

const listPreviousOrders = {
  exec({ $mongo: { $dbPub } }, { memberId }) {
    const orderStatuses = ['paid', 'completed'];
    assert(memberId, 'A memberId is required');

    return $dbPub
      .collection('orders')
      .find({ memberId, orderStatus: { $in: orderStatuses } })
      .project({ header: 1, updatedAt: 1, _id: 1, orderStatus: 1, total: 1 })
      .toArray();
  },
};

export default listPreviousOrders;
