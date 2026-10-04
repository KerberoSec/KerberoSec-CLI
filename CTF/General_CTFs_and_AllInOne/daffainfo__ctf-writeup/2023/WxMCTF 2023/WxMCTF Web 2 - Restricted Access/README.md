# WxMCTF Web 2: Restricted Access
> Legend has it that WLMAC has a super duper secret website, currently being used to plot attacks against MGCI...

> Access the challenge right here: https://weba.jonathanw.dev:3002/

## About the Challenge
We were given a website and we need to change some headers to get the flag

*[Image: preview]*

## How to Solve?
First, you need to change the `User-Agent` header to `lyonbrowser`

*[Image: first]*

And then you need to add a header called `Referer` and the value is `https://maclyonsden.com/`

*[Image: second]*

And then you need to add a header called `Date` and the value is `2043`

*[Image: third]*

Add another header called `Upgrade-Insecure-Requests` and the value is `1`

*[Image: fourth]*

And the last one you need a header called `Downtime` and set the value into a big number for example 99999999999

*[Image: last]*

```
wxmctf{s3cret_sit3_http_head3rs_r_c0o1}
```