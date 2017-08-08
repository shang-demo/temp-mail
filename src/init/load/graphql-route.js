const graphqlHTTP = require('koa-graphql');

function lift() {
  let config = {
    schema: this.graphql.schema,
    formatError(e) {
      logger.warn('originalError: ', e.originalError || e);

      return {
        message: e.message,
        locations: e.locations,
        path: e.path,
        extra: (e.originalError || {}).extra,
      };
    },
    graphiql: this.config.graphql && this.config.graphql.graphiql,
  };

  this.graphql.routes = graphqlHTTP(config);
}

module.exports = lift;
