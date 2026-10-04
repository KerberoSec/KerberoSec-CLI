# Server-side Request Forgery (SSRF)

## Basic SSRF against the local server

1. Click on a product
2. Request the stock count of the product
3. Change the url of the `stockApi` parameter to point to `localhost/admin`
4. View the rendered page and the source to find our that we need to set the
   `stockApi` url to `localhost/admin/delete?username=carlos`

## Basic SSRF against another back-end system

1. Click on a product
2. Request the stock count of the product
3. Send request to Intruder
4. Change the url of the `stockApi` parameter to point to `http://192.168.0.$1$/admin`
   - set `$1$` to a number between 1 and 255.
5. look for `200` status answer
6. delete carlos
