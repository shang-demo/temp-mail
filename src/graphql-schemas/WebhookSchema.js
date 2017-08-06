const {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');

const WebhookType = new GraphQLObjectType({
  name: 'Webhook',
  description: 'Web  hook',
  fields: () => {
    return ({
      _id: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: new GraphQLNonNull(GraphQLString) },
      events: {
        type: GraphQLString,
        args: {
          separator: {
            type: GraphQLString
          }
        },
        resolve(hook, { separator }) {
          if (!separator) {
            return hook.events || [];
          }
          return (hook.events || []).join(separator);
        },
      },
    });
  },
});

let query = {
  webhook: {
    type: WebhookType,
    description: '根据id查询单个webhook',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString)
      },
    },
    resolve(source, { id }) {
      return Webhook
        .findOne({
          _id: id,
        })
        .lean();
    }
  },
  webhooks: {
    type: new GraphQLList(WebhookType),
    description: '查询全部webhook列表',
    resolve() {
      return Webhook.find({}).lean();
    }
  }
};

module.exports = {
  query,
};

