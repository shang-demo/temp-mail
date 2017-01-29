

module.exports = {
  attributes: {
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  options: {
    connection: 'defaultMongo',
    collection: 'user',
    timestamps: true,
    // set: {
    //   toJSON: {
    //     transform(doc, ret) {
    //       ret.id = ret._id;
    //     },
    //   },
    // },
    // indices: null,
    // pre: null,
    // post: null,
  },
};
