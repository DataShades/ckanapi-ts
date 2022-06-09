type JSONPayload = {
  [k: string]: string | number | boolean | JSONPayload[] | JSONPayload;
};

type FormPayload = FormData;
// type NodePayload = { [k: string]: string | Buffer };

export class Payload<T =  JSONPayload | FormPayload>{
  constructor(protected payload: T) {}

  asBody() {
    if (this.payload instanceof FormData) {
      return this.payload;
    } else {
      return JSON.stringify(this.payload);
    }
  }
}

export class Action {
  protected version: number = 3;
  constructor(protected name: string) {}

  setVersion(v: number) {
    this.version = v;
  }

  url() {
    return `/api/${this.version}/action/${this.name}`;
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

  action = new Proxy({}, new ActionProxy(this));

  static clientFactory: () => IClient = () => {
    throw "Not implemented";
  };

  constructor(url: string | URL, client?: IClient) {
    this.client = client || Portal.clientFactory();
    this.url = new URL(url);
  }

  withToken(token: string): Portal {
    this.token = token;
    return this;
  }

  async invoke(action: Action, payload?: Payload): Promise<unknown> {
    const url = this.urlFor(action);

    const params: RequestParams = {
      headers: { Authorization: this.token },
      method: "POST",
      body: null,
    };

    params.body = payload ? payload.asBody() : null;

    if (typeof params.body === "string") {
      params.headers["content-type"] = "application/json";
    }

    const resp = await this.client.request(url.toString(), params);

    const data = (await resp.json()) as any;

    if (!data.success) {
      throw data.error;
    }

    return data.result;
  }

  protected urlFor(action: Action): URL {
    return new URL(action.url(), this.url);
  }
}
