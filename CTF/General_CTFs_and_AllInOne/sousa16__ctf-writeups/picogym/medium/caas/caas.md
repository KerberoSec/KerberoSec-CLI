## caas

[Link to challenge](https://play.picoctf.org/practice/challenge/202)

Write-up:

1. GET requests to /cowsay/{message} print the message that was given. After a little
research, I found out that you can use `GET /cowsay/$(ls)` to print directory 
contents: successful command injection, and we find `falg.txt`.

2. `GET /cowsay/%24%28cat%20falg.txt%29` gets us the flag: **picoCTF{moooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo0o}**

