# Hunt

## Description

Agent, it looks like ARIA has spun up a simple website. Is there anything you can find to give more information about its plans?

https://uscybercombine-s4-hunt.chals.io/

## Solution

- First, I navigated to the provided website. Inspecting the HTML of this page reveals part of the flag in the comments. The comment also
tells us to "check in on the bots," which tells me that we need to look at this site's
**robots.txt**.
- Navigating to https://uscybercombine-s4-hunt.chals.io/robots.txt reveals the next
part of the flag. From there, we can see that <code>/secret-bot-spot</code>
is disallowed by "Humans."
- After navigating to https://uscybercombine-s4-hunt.chals.io/secret-bot-spot, we can check the JavaScript source of the page.
At the end of the JS file is a comment with the last part of the flag.

## Flag

SIVBGR{r1s3_0f_th3_r0b0ts!}
