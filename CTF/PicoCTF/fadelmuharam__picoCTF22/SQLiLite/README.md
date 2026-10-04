# SQLiLite
## Description

Can you login to this website?

`http://saturn.picoctf.net:{port}/`

### SOLVING
* We have to start an instance, to launch the site. From the challenge name we can see SQL"`i`"Lite, where the letter i indicates us that this could be sql injection.
* Let’s login using random credentials and see what the webpage returns. In this case, I'm using username=admin and password=admin

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/SQLiLite/images/Screenshot_2022-05-18_23-48-52.png)

* Now we know the query used to return the data from table.
* We have to use SQL injection payloads to exploit this.
* I'm using common SQLi payloads.
> ' or 1=1 --
* The “: “ means we comment the remaining query command and “or 1=1” sets as logical condition to pass the query.

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/SQLiLite/images/Screenshot_2022-05-18_23-58-10.png)

* Now we have logged in, but the flag is hidden. So let's try to Inspect element this page (F12)

![Picture](https://github.com/fadelmuharam/picoCTF22/blob/master/SQLiLite/images/Screenshot_2022-05-19_00-01-45.png)
