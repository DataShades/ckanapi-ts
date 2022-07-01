
Typescript/JS client for CKAN data portals.

This library provides full access to the CKAN API, including any built-in or 3rd party extensions, like `datastore` or `ckanext-dcat`.

It can be used either as a pure JS library inside a web browser and NodeJS or as a typescript library as long as it transpiled/bundled using `webpack`, `rollup`, `vite`, `tsc`, or any other tool of your choice

It **does not** depend on jQuery or any other library, that provides an extra layer of complexity between your code and your data. Authors of this library tend to use native JS API instead of polyfills. In rare cases, when the support of an old browser is required, it will be much more efficient to use `babel` and supply your code with a minimal set of polyfills instead of carrying the baggage of unused monstrous library everywhere 🙂

The only dependency included in this library is a `node-fetch`, which is used on old NodeJS versions before FetchAPI becomes a part of the runtime.

##### Structure

* [Usage](#usage)
  * [NodeJS](#nodejs)
  * [Browser](#browser)
  * [Typescript / React / Vue / Svelte / Angular / etc.](#typescript--react--vue--svelte--angular--etc)
  * [NodeJS](#nodejs)
* [Basics](#basics)
  * [Chain-style](#chain-style)
  * [Struct-style](#struct-style)
* [Advanced](#advanced)
  * [API Documentation](#api-documentation)
  * [Interceptors](#interceptors)
* [Examples](#examples)
  * [Browsing the Data Catalogue](#browsing-the-data-catalogue)
  * [Searching the Data Catalogue](#searching-the-data-catalogue)
  * [Working with Dataset Resources within the Datastore](#working-with-dataset-resources-within-the-datastore)

## Usage

`ckanapi` shares the same interface between all environemnts. Only typescript a bit different, because there you have information about types, which makes life much easier. But other from that, all the usage examples are suitable for all the environments.

Before starting, you have to add `ckanapi` to your project

#### NodeJS

1. Install a package:
   ```sh
   npm i ckanapi
   ```

1. Import it:
   ```js
   const CkanApi = require("ckanapi")
   ```

#### Browser

* Either add `ckanapi/dist/browser.js` file from the `ckanapi` package to your static assets,
* or include the latest version of the library from the [UNPKG CDN](https://unpkg.com/):

  ```html
  <script
    type="text/javascript"
    src="https://unpkg.com/ckanapi@latest/dist/browser.js"></script>
  ```

Both options will register `CkanApi` object inside the global scope.

#### Typescript / React / Vue / Svelte / Angular / etc.

Import the whole library:

```js
import * as CkanApi from "ckanapi"
```

Or just required components in order to get the best from tree-shaking:

```js
import { Portal, Action } from "ckanapi"
```

## Basics


Create an instance of `Portal` that will communicate with the CKAN application. Its constructor expects the URL of the CKAN application.
Optionally, provide an API Token in order to pass the authorization check of the restricted actions. You don't have to set API Token, without it all requests will be made on behalf of the anonymous user.

```js
// anonymous client. Suitable for package search and display
const portal = new CkanApi.Portal("https://demo.ckan.org")

// different client that will perform requiests on behalf of the token owner
const portalWithUser = portal.withToken("my-secret-api-token")
```

Pay attention to the example above. `Portal::withToken` creates a new instance of the portal. This means, that `portal` from the example still performs un-authenticated requests, while `portalWithuser` acts as the logged-in user. That allows you to split the single anonymous client into multiple independent user-clients:

```js
// first user
const john = portal.withToken("john-secret-api-token")
// second user
const ashley = portal.withToken("ashley-secret-api-token")

// sysadmin for the really specific cases
const sysadmin = portal.withToken("admin-secret-api-token")
```

ℹ By the way, API Token can be obtained under **API Tokens** tab of your user profile in the CKAN's WEB UI(`/user/<username>/api-tokens`). Alternatively, if you have access to the CKAN CLI, you can generate a token via the following command:

```sh
ckan user token add <username> <token-name>
```

❗If you see the **CORS** related error in your browser, it means that the CKAN application does not set CORS headers on the response. If you have access to the application's config file, you can quickly fix it by adding `ckan.cors.origin_allow_all = true` config option. But before doing it on production, make sure you analyzed the impact of this change on your portal.

Using the `Portal` instance you are allowed to interact with absolutely every native and custom CKAN API endpoint. There are two flavors of API interaction. Internally they are identical but depending on your preferences and situation, you can choose either one. Let's call the `status_show` action, which displays basic information about the portal:

```js
// Chained style, for js/python/ruby lovers
portal
  .action
  .status_show()
  .then(data => console.log(data))

// Structure style for go/rust/haskel adepts
const action = new CkanApi.Action("status_show")
const data = await portal.invoke(action)
console.log(data)
```

That's general wokflow for:

#### Chain-style:

* Pick an action using `portal.action.<action_name>` expression. `portal.action` is a proxy, that allows you to pick any CKAN API endpoint by its name. As result, you'll get the function that calls the corresponding action:

  ```js
  const status_show = portal.action.status_show
  const pendingResult = status_show()
  ```

* Call the action. It returns a promise, which rejects if an error is returned from CKAN API. And resolves otherwise. You can handle it in the following way:

  ```js
  status_show().then(
    // success
    data => console.log(data),
    // error
    err => console.error(err)
  )
  ```

* If required, pass payload to the action call:

  ```js
  portal.action.package_search({"q": "*:*"})
  ```

#### Struct-style:

* Create an action object. It expects the name of an action as a parameter:

  ```js
  const action = new CkanApi.Action("status_show")
  ```

* Path the action to the `Portal::invoke` function. It also returns a promise, so you need to `await` for it. And handle possible exxceptions:

  ```js
  let data;
  try {
    data = await portal.invoke(action)
  } catch (err) {
    console.error(err)
  }
  ```

* If required, pass payload to the `Portal::invoke` as a second parameter:

  ```js
  const action = new CkanApi.Action("package_search")
  const params = {"q": "*:*"}
  const data = await portal.invoke(action, params)
  ```

#### Payload

Often, CKAN actions expect some kind of user input. Above you've seen, how to pass the input to actions. Specific parameters that have a sense for the particular action can be found in the [CKAN API docs](http://docs.ckan.org/en/latest/api/index.html).

`ckanapi` expects action payload to be represented by:

* JSON serializable object

  ```js
  const payload = {
    a: 1,
    b: "string",
    c: boolean,
    d: null,
    e: ['array', 'of', 'values'],
    f: {nested: 'object'}
  }
  ```

* FormData object:

  ```js
  const form = new FormData
  form.append("field", "value")
  form.append("another", "field")
  ```

## Advanced

There is a number of extra features that are not required for daily use, but you may find them convenient in rare cases.

### API Documentation

Majority of the CKAN API actions provide brief documentation. It can be obtained in the following way for the any `Action` object:

```js
const action = new CkanApi.Action("package_search")
const docs = await portal.documentation(action);
console.log(docs)
```

### Interceptors

If you want to modify the URL/payload/headers before the request or preprocess response, before it is parsed as a JSON, you can use interceptors. These are functions, that are added like middleware to the `Portal` instance. Each interceptor called twice:

* before the request. The URL and parameters which will be used by the underlying HTTP client(`fetch`) are passed to this call. At this point, you can mutate the URL, add headers ar modify the payload
* after the request. The URL, the parameters, and the **response** passed to this call. You can use URL and params as a reference here, there is no reason to change them now. As for response, you can do whatever you want with it. Additionally, if the interceptor returns something, this "something" will be used instead of the response.

```js
async function myInterceptor(url, params, response = null) {
  if (response) {
    // called after the request
    if (!isAcceptableByMyCode(resp)) {
      return createADifferentResponse(url, params)
    }

  } else {
    // called before the request
    params["headers"]["accept"] = "application/json";
  }
}

portal.addInterceptor(myInterceptor)

```

## Examples

Here you'll find a number of usage examples for `ckanapi`. If you know CKAN API and have read the details above, you probably don't need them. But if you are new to the CKAN API and just want to quickly grab a solution for the common use-case, this section was designed for you.

All the examples expect a `Portal` to be available as a `portal` variable. You can create it in the following way:
```js
const portal = new CkanApi.Portal("https://demo.ckan.org")
```

### Browsing the Data Catalogue
Return a list of Datasets
```js
const data = await portal.action.package_list()
```

Return activity stream list of Dataset
```js
const payload = {"id": ID}
const data = await portal.action.package_activity_list(payload)
```

Return Dataset Details and Metadata
```js
const payload = {"id": ID}
const data = await portal.action.package_show(payload)
```

Return a list of Dataset keywords/tags
```js
const payload = {"id": ID}
const data = await portal.action.package_show(payload).then(
  data => data.tags.map(t => t.name)
)

```

Return a list of Dataset Resources
```js
const payload = {"id": ID}
const data = await portal.action.package_show(payload).then(
  data => data.resources
)
```

Return Dataset Resource Details and Metadata
```js
const payload = {"id": ID}
const data = await portal.action.resource_show(payload)
```

Return a list of Organisations
```js

const data = await portal.action.organization_list()
```

Return Organisations Details
```js
const payload = {"id": ID}
const data = await portal.action.organization_show(payload)
```

Return a list of custom groups with type "topic"
```js
const payload = {"type": "topic"}
const data = await portal.action.group_list(payload)
```

Return a list of Groups
```js
const data = await portal.action.group_list()
```

Return Group Detail
```js
const payload = {"id": ID}
const data = await portal.action.group_show(payload)
```

Return a list of Users
```js
const data = await portal.action.user_list()
```

Return User Detail
```js
const payload = {"id": ID}
const data = await portal.action.user_show(payload)
```


### Searching the Data Catalogue
Return a list of filters(facets) for the `license_id` and `res_format` field.
```js
const payload = {
  "rows": 0,
  "facet.field": ["license_id", "res_format"]
}
const data = await portal.action.package_search(payload).then(
  data => data.facets
)
```

Return a list of filter values for the `license_id` and `res_format` field found in result set
```js
const payload = {
  "rows": 0,
  "facet.field": ["license_id", "res_format"],
  "q": "search query"
}
const data = await portal.action.package_search(payload).then(
  data => data.facets
)

```

Return a list of Datasets matching search term
```js
const payload = {
  "q": "search term"
}
const data = await portal.action.package_search(payload).then(
  data => data.results
)

```

Return a faceted list of Datasets
```js
const payload = {
  "facet.field": ["license_id", "res_format"],
  "q": "*:*"
}
const data = await portal.action.package_search(payload).then(
  data => data
)
```

Return a list of keywords/tags
```js
const data = await portal.action.tag_list()

```


### Working with Dataset Resources within the Datastore
Returning data from a Datastore Dataset Resource
```js
const payload = {"id": ID}
const data = await portal.action.datastore_search(payload).then(
  data => data.records
)
```

Searching data within a Datastore Dataset Resources
```js

﻿
const payload = {
  "id": ID,
  "filters": {"a": 1}
}
const data = await portal.action.datastore_search(payload).then(
  data => data.records
)
```

Creating a Datastore Dataset Resource
```js

const user = portal.withToken(TOKEN)

const payload = {
  "id": ID,
  "force": true,
  "primary_key": ["a"],
  "records": [
    {a: 10, b: 20, c: 30 }
  ]
}
const data = await user.action.datastore_create(payload)
```

Adding a row of data to a Datastore Dataset Resource
```js
const user = portal.withToken(TOKEN)

const payload = {
  "id": ID,
  "force": true,
  "type": "insert",
  "records": [
    {a: 11, b: 22, c: 33 }
  ]
}
const data = await user.action.datastore_upsert(payload)
```

Editing a row of data to a Datastore Dataset Resource
```js

const user = portal.withToken(TOKEN)

const payload = {
  "id": ID,
  "force": true,
  "type": "update",
  "records": [
    {a: 11, b: 222, c: 333 }
  ]
}
const data = await user.action.datastore_upsert(payload)
```

Deleting a row of data from a Datastore Dataset Resource
```js

const user = portal.withToken(TOKEN)

const payload = {
  "id": ID,
  "force": true,
  "filters": {"a": 11}
}
const data = await user.action.datastore_delete(payload)
```
