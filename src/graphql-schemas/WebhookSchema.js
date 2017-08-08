const {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

const WebhookQueryType = new GraphQLObjectType({
  name: 'Webhook',
  description: 'Web  hook',
  fields: () => {
    return UtilService.buildGraphqlType(Webhook.getAttributes(), {
      extra: {
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
      }
    });
  },
});

const WebhookCreateInput = new GraphQLInputObjectType({
  name: 'WebhookCreateInput',
  description: 'webhook 添加',
  fields() {
    return UtilService.buildGraphqlType(mKoa.model.Webhook.attributes, {
      omit: ['_id'],
      extra: {
        events: { type: new GraphQLList(GraphQLString) },
      },
    });
  }
});

const WebhookUpdateInput = new GraphQLInputObjectType({
  name: 'WebhookUpdateInput',
  description: 'webhook 更新',
  fields() {
    return UtilService.buildGraphqlType(mKoa.model.Webhook.attributes, {
      omit: ['_id'],
      extra: {
        events: { type: new GraphQLList(GraphQLString) },
      },
      plain: true,
    });
  }
});

let query = {
  events: {
    type: new GraphQLList(GraphQLJSON),
    resolve() {
      return _.map(HookService.events, (value) => {
        return value;
      });
    }
  },
  webhook: {
    type: WebhookQueryType,
    description: '根据id查询单个webhook',
    args: {
      _id: {
        type: new GraphQLNonNull(GraphQLString)
      },
    },
    resolve(source, { _id }) {
      return Webhook
        .findOne({
          _id,
        })
        .lean();
    }
  },
  webhooks: {
    type: new GraphQLList(WebhookQueryType),
    description: '查询全部webhook列表',
    args: {
      search: {
        type: GraphQLString
      },
    },
    resolve(root, { search }) {
      let condition = {};

      if (search) {
        condition = {
          $or: [{
            name: {
              $regex: _.escapeRegExp(search),
              $options: 'gi',
            },
          }],
        };
      }
      return Webhook.find(condition).lean();
    }
  }
};

let mutation = {
  addWebhook: {
    type: WebhookQueryType,
    description: '添加webhook',
    args: {
      webhook: { type: WebhookCreateInput }
    },
    resolve(source, { webhook }) {
      return Webhook.create(webhook);
    }
  },
  updateWebhook: {
    type: WebhookQueryType,
    description: '更新webhook',
    args: {
      _id: { type: new GraphQLNonNull(GraphQLString) },
      webhook: { type: WebhookUpdateInput }
    },
    resolve(source, { _id, webhook }) {
      return Webhook
        .update({
          _id,
        }, webhook);
    }
  },
  removeWebhook: {
    type: GraphQLString,
    description: '删除 webhook',
    args: {
      _id: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve(root, { _id }) {
      return Webhook.remove({ _id })
        .then(() => {
          return _id;
        });
    },
  }
};

module.exports = {
  query,
  mutation,
};

