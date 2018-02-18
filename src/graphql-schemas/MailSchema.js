const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql');

const MailInQueryType = new GraphQLObjectType({
  name: 'MailIn',
  description: 'mail query',
  fields: () => {
    return UtilService.buildGraphqlType(Mail.getAttributes());
  },
});

let query = {
  mails: {
    type: new GraphQLList(MailInQueryType),
    description: 'mail list',
    args: {
      shortId: {
        type: new GraphQLNonNull(GraphQLString),
      },
      type: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve(root, { shortId, type }) {
      if (type === 'in') {
        return MailInService.query(shortId);
      }
      else if (type === 'out') {
        return MailOutService.query(shortId);
      }

      return Promise.reject(new Errors.QueryError());
    },
  },
};

module.exports = {
  query,
};
