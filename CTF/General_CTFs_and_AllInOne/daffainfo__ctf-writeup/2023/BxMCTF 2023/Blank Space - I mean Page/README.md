# Blank Space: I mean Page
> Have fun finding the flag…regardless if you're capable of solving CAPTCHAs or not.

> https://bxmweb1.jonathanw.dev/

## About the Challenge
We were given a very simple website

*[Image: preview]*

## How to Solve?
As usual, im gonna check some interesting endpoints first such as `robots.txt` or `sitemap.xml`. And this website have a `robots.txt` file

*[Image: robots]*

Now, we need to access `/very-secretly-hidden` endpoint to obtain the flag

*[Image: flag]*

```
ctf{sdh57349857243fkhkwAklkAH}
```