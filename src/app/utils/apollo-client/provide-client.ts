import { ApolloClient, createNetworkInterface } from 'apollo-client';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://127.0.0.1:1337',
  }),
});

export function provideClient(): ApolloClient {
  return client;
}

