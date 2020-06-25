# Proxy to live CKS search

- `npm install`
- `npm start`

Access live CKS search API at http://localhost:6001/search

e.g. http://localhost:6001/search?q=cancer

You can also run

- `npm run fail`

to proxy the response as usual but replace the `failed` key with `true` for testing error handling.