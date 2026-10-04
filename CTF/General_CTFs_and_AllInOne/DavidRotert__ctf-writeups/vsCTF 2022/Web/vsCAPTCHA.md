# vsCAPTCHA

## The App
vsCAPTCHA is secured by a special CAPTCHA kind of thing written in TypeScript and Deno.

1. `b1` and `b2` are initialized with a random number from 0-500
2. app starts to listen to `POST` requests in `/captcha`
	1.  if Header `x-captcha-state` is set, it checks if body JSON value `solution` is equal to expected CAPTCHA
	2. expected CPATCHAs are stored in a Map `random JWT UUID` => expected
	3. If expeted value does not match `solution`, it returns and sets JWT field `failed` to `true`
	4. else it generates a new CPATCHA, stores it in the map of expected value
	5. You can get the flag if you have more than 1000 CAPTCHA solves

The CAPTCHA is generated with following code:

```typescript
const num1 = Math.floor(Math.random() * 7) + b1;
const num2 = Math.floor(Math.random() * 3) + b2;

const captchaText = `${num1} + ${num2}`;
```

## Tried solutions
### Brute force
The shown CAPTCHA is only 6 random Digits max. Because `b1` and `b2` are only initialized at startup of the application, they never change. If we have at least 1 CAPTCHA image, it sould be possible to try out what `b1` and `b2` is and then we can brute force a new captcha by just trying out all remaining expected values because the range is really low (just maximum of 15 for `num1` and maximum of 7 for `num2`).

#### Pitfalls
- The JWT success counter is reset to 0 if the old token is invalid
- the expiry was not not extended for failed solving attempts which makes brute force on the original server more complicated

#### Problems
The Python code didn't work at first because of multiple bugs. I worked them out and it worked on the local setup but not on the CTF server beacuse the connection had ~500 ms delay and the token was reset to early. Then I tried to refactor my code and limit the try range but this only broke the code.

## Considered solutions

### Cracking the random generator state/predicting random numbers
Because the random range is so small and non cryptographically secure random numbers were used, it might be possible to predict them. But not sure how to approach that.