const svc = {
  save(opts, raw, purpose) {
    return Mail
      .update({
        messageId: opts.messageId,
      }, {
        $set: _.assign({ rawData: raw, purpose }, opts),
      }, {
        upsert: true,
      });
  },
};

module.exports = svc;
