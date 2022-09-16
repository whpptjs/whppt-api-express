module.exports = {
  exec({ $id, $mongo: { $publish, $save } }, { redirect }) {
    redirect._id = redirect._id || $id.newId();
    redirect.published = true;

    return $save('redirects', redirect).then(() => {
      return $publish('redirects', redirect).then(() => {
        return redirect;
      });
    });
  },
};
