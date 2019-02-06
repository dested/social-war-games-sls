export interface Event<T> {
  body: T;
  headers: Headers;
  httpMethod: string;
  path: string;
}

export interface Headers {
  Authorization: string;
  authorization: string;
  gameid: string;
}
