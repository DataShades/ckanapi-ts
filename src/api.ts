type JSONPayload = {
  [k: string]: string | number | boolean | JSONPayload[] | JSONPayload;
};

type FormPayload = FormData;
// type NodePayload = { [k: string]: string | Buffer };

export class Payload {
  constructor(protected payload: JSONPayload | FormPayload) {}

  asBody() {
    if (this.payload instanceof FormData) {
      return this.payload;
    } else {
      return JSON.stringify(this.payload);
    }
  }
}

type Interceptor = (
  url: URL,
  params: RequestParams,
  resp?: IResponse
) => Promise<IResponse | null> | IResponse | null;

export class Action {
  protected version: number = 3;
  constructor(public readonly name: string) {}

  setVersion(v: number) {
    this.version = v;
  }

  url() {
    return `api/${this.version}/action/${this.name}`;
  }
}

export interface IClient {
  request(url: string, params?: RequestParams): Promise<IResponse>;
}

export interface IResponse {
  json(): Promise<unknown>;
}

export type RequestParams = {
  method: string;
  headers: any;
  body: any;
};

class ActionProxy {
  constructor(protected portal: Portal) {}

  get(_target: any, prop: string, _receiver: any) {
    const action = new Action(prop);
    return this.portal.invoke.bind(this.portal, action);
  }
}

export class Portal {
  protected token?: string;
  protected client: IClient;
  protected url: URL;
  protected interceptors: Interceptor[] = [];

  action = new Proxy({}, new ActionProxy(this));

  static clientFactory: () => IClient = () => {
    throw "Not implemented";
  };

  constructor(url: string | URL, client?: IClient) {
    this.client = client || Portal.clientFactory();
    this.url = new URL(url);
    if (this.url.pathname.slice(-1) !== "/") {
      this.url.pathname += "/";
    }
  }

  withToken(token: string): Portal {
    const portal = new Portal(this.url, this.client);
    portal.token = token;
    portal.interceptors = this.interceptors.slice();

    return portal;
  }

  async invoke<T>(
    action: Action,
    payload?: JSONPayload | FormPayload | Payload
  ): Promise<T> {
    const url = this.urlFor(action);

    const headers = this.token ? { Authorization: this.token } : {};
    const params: RequestParams = {
      headers,
      method: "POST",
      body: null,
    };

    if (payload) {
      params.body = (
        payload instanceof Payload ? payload : new Payload(payload)
      ).asBody();
    }

    if (typeof params.body === "string") {
      params.headers["content-type"] = "application/json";
    }

    await this.beforeRequest(url, params);

    const resp = await this.afterRequest(
      url,
      params,
      await this.client.request(url.toString(), params)
    );

    const data = (await resp.json()) as any;

    if (!data.success) {
      throw data.error;
    }

    return data.result;
  }

  documentation(action: Action) {
    return this.invoke<string>(new Action("help_show"), { name: action.name });
  }

  urlFor(action: Action): URL {
    return new URL(action.url(), this.url);
  }

  private async beforeRequest(url: URL, params: RequestParams) {
    for (let i of this.interceptors) {
      await i(url, params);
    }
  }

  private async afterRequest(url: URL, params: RequestParams, resp: IResponse) {
    for (let i of this.interceptors.slice().reverse()) {
      let r = await i(url, params, resp);
      if (r) {
        resp = r;
      }
    }
    return resp;
  }

  addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }
}
