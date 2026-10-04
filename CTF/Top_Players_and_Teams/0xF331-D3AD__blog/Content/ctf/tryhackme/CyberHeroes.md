
# CyberHeroes

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.107.210 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

Ok, let's go to login form and try to authenticate. I tried a couple of common
default creds, but none has worked. It got me wandering, what exactly is backend
saying when you try invalid creds, but login form wasn't sending any requests at all!
Which means, the authentication (or at least part of it) occurrs at client side.

Open the login page, go to dev tools, find the source code of login button and checkout
the event handler:

```javascript
function authenticate() {
      a = document.getElementById('uname')
      b = document.getElementById('pass')
      const RevereString = str => [...str].reverse().join('');
      if (a.value=="h3ck3rBoi" & b.value==RevereString("54321@terceSrepuS")) { 
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            document.getElementById("flag").innerHTML = this.responseText ;
            document.getElementById("todel").innerHTML = "";
            document.getElementById("rm").remove() ;
          }
        };
        xhttp.open("GET", "RandomLo0o0o0o0o0o0o0o0o0o0gpath12345_Flag_"+a.value+"_"+b.value+".txt", true);
        xhttp.send();
      }
      else {
        alert("Incorrect Password, try again.. you got this hacker !")
      }
    }
```

Revese the password and login with those credentials.
