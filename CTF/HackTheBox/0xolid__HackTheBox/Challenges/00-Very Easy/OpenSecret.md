# OpenSecret Writeup

> Category : Web

> A simple help desk portal where users can submit support tickets. The application uses JWT tokens for session management, but something seems off about how they're implemented. Can you find the security flaw?

## Solution

Browsing `http://154.57.164.78:31465` to see what's there.

We found a simple help desk portal where users can submit support tickets. But there is nothing interesting.

So let's view the page source code.
And easily we can found the flag in plain text.

```js
<!-- JavaScript -->
        <script>
            // JWT Secret Key
            const SECRET_KEY = "HTB{0p3n_s3cr3ts_ar3_n0t_s3cr3ts}";
```

```text
HTB{0p3n_s3cr3ts_ar3_n0t_s3cr3ts}
```

