# Scavenger Hunt

### Desccription :
There is some interesting information hidden around this site http://mercury.picoctf.net:39491/. Can you find it?

## Solution

This challenge was very simple, we have to just see website sourcecode.

in given website source code we find : 

```html
<!-- Here's the first part of the flag: picoCTF{t -->
```
in css file :

```html
/* CSS makes the page look nice, and yes, it also has part of the flag. Here's part 2: h4ts_4_l0 */
```

Now we have to check ' robots.txt ' file :

```txt
User-agent: *
Disallow: /index.html
# Part 3: t_0f_pl4c
# I think this is an apache server... can you Access the next flag?
```
we have part 3 of flag and also some hint for part 4, 

apache server ???

do you remember something like robots.txt in apache, 😗 
it's ' .htaccess ' , let's see what is inside it :

```html
# Part 4: 3s_2_lO0k
# I love making websites on my Mac, I can Store a lot of information there.
```

now we have part 4 with hit for last part 5, it's about ' .DS_Store '
inside that :

```html
Congrats! You completed the scavenger hunt. Part 5: _f7ce8828}
```
we can get flag by combining all 5 parts :

    part 1: picoCTF{t                
    part 2: h4ts_4_l0  
    Part 3: t_0f_pl4c
    Part 4: 3s_2_lO0k
    Part 5: _f7ce8828}

#### flag :  picoCTF{th4ts_4_l0t_0f_pl4c3s_2_lO0k_f7ce8828}