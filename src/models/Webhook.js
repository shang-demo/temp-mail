module.exports = {
  attributes: {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    events: {
      type: Array,
      index: true,
    },
    method: {
      type: String,
    },
    headerFields: {
      type: Mixed,
    },
    bodyFields: {
      type: Mixed,
    },
    useBodyTransform: {
      type: Boolean,
    },
    bodyTransform: {
      type: String,
    },
    payloadAddress: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
    },
    resolveBody: {
      type: Boolean,
      default: false,
    },
    suspended: {
      type: Boolean,
      required: true,
    },
  },
};
