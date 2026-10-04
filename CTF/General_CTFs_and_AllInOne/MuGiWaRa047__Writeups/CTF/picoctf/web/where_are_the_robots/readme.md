# where_are_the_robots

### Desccription :
Can you find the robots? https://jupiter.challenges.picoctf.org/problem/56830/  or http://jupiter.challenges.picoctf.org:56830

## Solution

this challenge was very easy. as name is 'where_are_the_robots' we can guess that this is something about `robots.txt`.

what we have to do is search for `robots.txt` in given url.

```html

https://jupiter.challenges.picoctf.org/problem/56830/
to
https://jupiter.challenges.picoctf.org/problem/56830/robots.txt

```

<details>
<summary markdown="span">click to see robots.txt : </summary>

```

User-agent: *
Disallow: /1bb4c.html

```
                                
</details>

in robots.txt there is a file with name of ' /1bb4c.html ' , now we have to just go to that page :
      https://jupiter.challenges.picoctf.org/problem/56830/1bb4c.html

you will get the flag.

#### flag :   picoCTF{ca1cu1at1ng_Mach1n3s_1bb4c}