# helicoptering
The app is just a website linking to two flag files. The files are protected with Apache Rewrite rules:

```htaccess
#one/.htaccess

RewriteEngine On
RewriteCond %{HTTP_HOST} !^localhost$
RewriteRule ".*" "-" [F]
```

```htaccess
#two/.htaccess

RewriteEngine On
RewriteCond %{THE_REQUEST} flag
RewriteRule ".*" "-" [F]
```

For an explaination how rewrite rules work: https://httpd.apache.org/docs/2.4/rewrite/intro.html

## Bypassing rewrite rules
The condition for the first flag means, that all requests not coming from the regular expression `^localhost$` are blocked if they met the rule `.*`.

One Idea was to bypass the rewrite rule by URL encoding. Unfortunately, this did not work.

Second Idea was to somehow rewrite the host. Maybe it would be possible to set localhost to the IP in the `/etc/hosts` file. But this did not work either.

Bypassing the rewrite rule for the second part of the flag worked though by URL encoding the file name: `GET http://34.87.217.252:30026/two/%66%6C%61%67%2E%74%78%74`

`next_time_im_using_nginx}`