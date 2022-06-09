
Typescript/JS client for CKAN data portals.

This library provides full access to the CKAN API, including any built-in or 3rd party extension, like `datastore` or `ckanext-dcat`.

It can be used either as a pure JS library inside a web browser and NodeJS, or as a typescript library as long as it transpiled/bundled using `webpack`, `rollup`, `vite`, `tsc` or any other tool of your choice

It **does not** depend on jQuery or any other library, that provides extra layer of complexity between your code and your data. Authors of this library tend to use native JS API instead of polyfils. In rare cases, when support of old browser is requred, it will be much more efficient to use `babel` and supply your code with minimal set of polyfils instead of carrying the baggage of unused monstruous library everywhere 🙂

CKAN_API_USE_NODE_FETCH=1 npx ts-node index.ts
