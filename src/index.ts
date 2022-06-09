import * as api from "./api";

export * as payloads from "./payloads";

import type { RequestParams } from "./api";
const nodeFetch = () => import("node-fetch");

class NodeFetchClient implements api.IClient {
  constructor() {}

  async request(url: string, params?: RequestParams): Promise<api.IResponse> {
    const fetch =
      !process.env.CKAN_API_USE_NODE_FETCH && global.fetch
        ? global.fetch
        : await nodeFetch().then((d) => d.default);
    return fetch(url, params);
  }
}

api.Portal.clientFactory = () => new NodeFetchClient();

export const { Portal, Action, Payload } = api;
