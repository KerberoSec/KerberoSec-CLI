# Logon

### Desccription :

The factory is hiding things from all of its users. Can you login as Joe and find what they've been looking at? https://jupiter.challenges.picoctf.org/problem/44573/  or http://jupiter.challenges.picoctf.org:44573

## Solution

Browse the given link, in website we have to do is just login with any name and password.

after login successful website use cookies for identify is user is admin or not in cookie `admin:False` we have to just change it to `admin:True` and save cookie and refresh the page.

<details>
<summary markdown="span">Click for Cookies : </summary>

```html

   admin:False
   password:yourpass
   username:joe

to
   admin:True
   password:yourpass
   username:joe

```
                                
</details>

booom, you have flag.

#### flag :   picoCTF{th3_c0nsp1r4cy_l1v3s_0c98aacc}