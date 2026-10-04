# Insp3ct0r

### Desccription :
Kishor Balan tipped us off that the following code may need inspection: https://jupiter.challenges.picoctf.org/problem/9670/ (link) or http://jupiter.challenges.picoctf.org:9670

## Solution

This challenge was very simple, we have to just see website sourcecode.

in given website source code we find : 

```code
<!-- Html is neat. Anyways have 1/3 of the flag: picoCTF{tru3_d3 -->
```
in css file :

```code
/* You need CSS to make pretty pages. Here's part 2/3 of the flag: t3ct1ve_0r_ju5t */
```

in js :

```code
/* Javascript sure is neat. Anyways part 3/3 of the flag: _lucky?2e7b23e3} */
```

#### flag :   picoCTF{tru3_d3t3ct1ve_0r_ju5t_lucky?2e7b23e3}