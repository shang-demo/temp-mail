const path = require('path');
const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const filePathOneLayer = require('../utilities/file-path-one-layer');

function lift() {
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */

  // eslint-disable-next-line no-multi-assign
  let queryFields = {};
  let mutationFields = {};

  return filePathOneLayer(path.join(this.projectPath, 'graphql-schemas'))
    .map((schemaFiles) => {
      let fileSchema = require(schemaFiles.path);
      _.assign(queryFields, fileSchema.query);
      _.assign(mutationFields, fileSchema.mutation);
      return undefined;
    })
    .then(() => {
      let obj = {};

      if (!_.isEmpty(queryFields)) {
        obj.query = new GraphQLObjectType({
          name: 'RootQuery',
          description: 'RootQuery',
          fields() {
            return queryFields;
          },
        });
      }

      if (!_.isEmpty(mutationFields)) {
        obj.mutation = new GraphQLObjectType({
          name: 'RootMutation',
          description: 'RootMutation',
          fields() {
            return mutationFields;
          },
        });
      }

      let schema = new GraphQLSchema(obj);

      this.graphqlConfig = {
        schema,
        graphiql: this.config.graphiql,
      };

      return undefined;
    });
}

module.exports = lift;
