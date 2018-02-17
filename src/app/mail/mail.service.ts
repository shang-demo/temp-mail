import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import io from 'socket.io-client';

const query = gql`
  query mailList($shortId: String!, $type: String!){
    mails(shortId:$shortId, type: $type) {
      messageId
      to
      from
      html
      text
      subject
      date
      rawData
    }
  }
`;

interface QueryResponse {
  mails: any;
}

@Injectable()
export class MailService {
  private shortId: string;
  private socket: any;

  constructor(private apollo: Apollo) {
  }

  public setShortId(shortId: string) {
    this.shortId = shortId;
    this.createSocket();
  }

  public getSocket() {
    return this.socket;
  }

  public query(type: string) {
    return this.apollo
      .watchQuery<QueryResponse>({
        query,
        variables: {
          shortId: this.shortId,
          type,
        },
      });
  }

  public createSocket() {
    try {
      this.socket.close();
    } catch (e) {
      // console.info(e);
    }
    this.socket = io(SERVER_URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            'short-id': this.shortId,
          },
        },
      },
    });
  }
}
