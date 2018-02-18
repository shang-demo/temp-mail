module.exports = {
  attributes: {
    purpose: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    to: {
      type: Mixed,
      required: true,
    },
    from: {
      type: Mixed,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    rawData: {
      type: String,
      required: true,
    },
  },
  options: {
    statics: {
      purposes: {
        in: 1,
        out: 2,
      },
    },
  },
};
