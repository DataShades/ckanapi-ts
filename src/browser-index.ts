import type { RequestParams } from "./api";
import * as api from "./api";

export * as payloads from "./payloads";

class BrowserFetchClient implements api.IClient {
  constructor() {}

  async request(url: string, params?: RequestParams): Promise<api.IResponse> {
    return fetch(url, params);
  }
}

api.Portal.clientFactory = () => new BrowserFetchClient();

export const { Portal, Action, Payload } = api;
