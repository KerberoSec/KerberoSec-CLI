# And Now, For Something Similar

This challenge presents us with a simple login form, which submits a POST request
to `/login.php` with the parameters "username" and "password". These fields were
both susceptible to SQLi, but certain keywords would cause the form to throw an
error before the injection was performed. These keywords were case-insensitive
and included the following.

* or
* select
* sleep
* union
* admin
* test
* password

It turned out that the challenge solution was just to successfully sign in using
valid credentials, so all we had to do was create a new user and log in.
To create a new user, we needed to guess what the users table looked like. In
this case, it was super standard: the table name was "users", with the fields
"username" and "password". So, to create a user, we injected the following SQL:

`INSERT INTO users VALUES ('ouruser', 'ourpass');`

The final solution was just two commands.
```
$ curl http://chal.tuctf.com:30005/login.php -d "username='; INSERT INTO users VALUES ('ouruser', 'ourpass');#"
$ curl http://chal.tuctf.com:30005/login.php -d username=ouruser -d password=ourpass
```
