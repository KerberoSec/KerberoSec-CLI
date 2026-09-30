# Resourcehub Core

## Exploit

In `exploit/solver.py`, we find that the exploit is a simple file upload to `../static/js/` using the API `/api/upload-resource`.
This is a simple path traversal vulnerability.

## Fix

The API is defined in `routes/routes.js` at `router.post('/api/upload-resource', (req, res) => { ... }`.

The fix is simply to remove the rest for the path and keep only the file name.
There are many ways to due this, like using `path.basename(filename)` or `filename.split("/").slice(-1)[0]`.

```js
const targetFilename = path.basename(file.originalFilename);
```

