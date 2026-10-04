# Passwordless

| 📁 Category   | 👨‍💻 Creator  |
|---------------|-------------|
 Web            | Ciaran

**Description:**
> Didn't have time to implement the email sending feature but that's ok, the site is 100% secure if nobody knows their password to sign in!
> 
> http://passwordless.chal.imaginaryctf.org

**Attachment:** [🔗 passwordless.zip](https://2025.imaginaryctf.org/files/passwordless/passwordless.zip)

## My solution
This challenge was my personal favourite of this CTF, since it's web-related and also included some very interesting knowledge required for the exploit.

In this challenge, you are given a web app with login/registration screen, with the goal of reaching the dashboard screen containing the flag, which is only accessible for authenticated users.

There are no obvious leaked credentials, so a direct login is not possible. The description suggests something about an email sending feature, so I had a rough idea what to look for when examining the source code which was provided for this challenge.

Looking at the source code, we have an Express.js server handling our login/registration process. Looking for the email hint, we can quickly find following code snippet:

<img width="823" height="276" alt="image" src="https://github.com/user-attachments/assets/0292111d-31a7-4774-aa5a-d881ddf4c59c" />

This snippet seems to be part of a registration endpoint, and the comment already tells us everything we need to know: Our registration endpoint creates a new user and adds them to the database, but the end-user never finds out their password, because the email-sending functionality for revealing the password was not implemented.

From the source code we can see that the password is the email plus a random 16 bytes long string:
```js
const initialPassword = req.body.email + crypto.randomBytes(16).toString('hex')
```

This means that we cannot guess the password, since the string attached to the email is truly random (since it's coming from the crypto module, not a pseudo-random generator).

Afterwards, this password is hashed with bcrypt and then stored into our in-memory SQLite database. With this information in mind, my initial idea was to look into the maximum length of a string that can be stored in such a database, so we can store an email so long, that the randomly generated appended string is just truncated. Unfortunately, I couldn't find a conclusive answer for the database idea, but this direction turned out to be the correct one just a bit later.

Meanwhile, my teammate Vexcited played around with the parts of the registration code, suspecting that something in the hashing logic might be flawed. After some playing around, we quickly found out some interesting things:

The idea of overflowing the length of the email to truncate the random added string seems good, but the code has some measures against that:

<img width="485" height="89" alt="image" src="https://github.com/user-attachments/assets/757e9018-8bed-4f30-b63e-c28e535377ae" />

If we take a closer look though, we don't check the length of the raw email coming from `req.body.email` (which is used for our hashing above), but the normalized email.

The normalization is done in the line above, using the `normalize-email` npm package. Most interestingly, the package removes aliases (everything after `+something` in an email address). This means that we can bypass the maximum length by making our email short, but the alias very long.

Now this alone isn't very helpful, because we don't know where the length overflow is happening. After some research on the behaviour of bcrypt hashing, me and my teammate Vexcited found out, that bcrypt has a cutoff after 72 bytes (or 52, based on config).

Putting all of this together, we can now construct an email that is so long that it fits exactly into those 72 bytes, so the attached random string is truncated.

This is the email we constructed:
```
ttt+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@gmail.com
```

Using this email, we were able to successfully log in and get the flag from the dashboard page:

<img width="2992" height="1868" alt="image" src="https://github.com/user-attachments/assets/1a600182-0483-41b2-8972-46dfc98bf229" />

That's it! We successfully solved the passwordless challenge 🎉
