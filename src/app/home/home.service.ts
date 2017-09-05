import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const query = gql`
  query demoQuery{
    version {
      env,
      version
    }
  }
`;

interface QueryResponse {
  version: {
    env: string,
    version: string,
  };
}

@Injectable()
export class HomeService {

  constructor(private apollo: Apollo) {
  }

  public search() {
    return this.apollo
      .watchQuery<QueryResponse>({
        query,
        variables: {
          p1: 100,
        },
      });
  }
}
