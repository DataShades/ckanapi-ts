
import {Portal, Payload, Action} from "./index";

describe("Action", () => {
  test("it builds url", () => {
    const action = new Action("test");
    expect(action.url()).toBe("/api/3/action/test");
  });

  test("it can use different version", () => {
    const action = new Action("test");
    action.setVersion(2);
    expect(action.url()).toBe("/api/2/action/test");
  });
});

describe("Portal", () => {
  test("it fetches status from demo.ckan.org", async () => {
    const portal = new Portal("https://demo.ckan.org");
    const action = new Action("status_show");
    const data = (await portal.invoke(action)) as any;
    expect(data.site_title).toBe("CKAN Demo");
  });

  test("it allows JSON payload", async () => {
    const portal = new Portal("https://demo.ckan.org");
    const action = new Action("package_search");
    const data = (await portal.invoke(action, new Payload({rows: 0, q: "test"}))) as any;

    expect(data.results).toBeTruthy();
    expect(data.facets).toBeTruthy();
  });

  test("it allows FormData payload", async () => {
    const portal = new Portal("https://demo.ckan.org");
    const action = new Action("package_search");

    const payload = new FormData();
    payload.append("rows", "0");
    payload.append("q", "test");

    const data = (await portal.invoke(action, new Payload(payload))) as any;

    expect(data.results).toBeTruthy();
    expect(data.facets).toBeTruthy();
  });

});

describe("ActionProxy", () => {
  test("it fetches status from demo.ckan.org", async () => {
    const portal = new Portal("https://demo.ckan.org");
    const data = await portal.action.status_show() as any;
    expect(data.site_title).toBe("CKAN Demo");
  });
});
