## login

[Link to challenge](https://play.picoctf.org/practice/challenge/200)

Write-up:

1. We are given a web page with a login form. After using Browser Inspect's Network section, we find a **index.js** file we can access.

2. This script is Base64 encoding both username and password and removing the '=' signs at the end. This script also shows us what the Base64 versions of username and password are.

3. After using CyberChef to decode, we get: **username=admin, password=picoCTF{53rv3r_53rv3r_53rv3r_53rv3r_53rv3r}**

4. Logging in gives us the flag, which happens to be the password: **picoCTF{53rv3r_53rv3r_53rv3r_53rv3r_53rv3r}**
   