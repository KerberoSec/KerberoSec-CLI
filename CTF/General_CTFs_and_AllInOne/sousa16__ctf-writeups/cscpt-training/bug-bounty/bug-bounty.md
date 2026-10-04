## Bug Bounty

[Link to challenge](https://training.cybersecuritychallenge.pt/challenges#Bug%20Bounty-5)

Write-up:

1. By visiting robots.txt, we see that a /.well-known directory exists
   
2. We can use [this](https://github.com/moul/awesome-well-known) repository to find a list of /.well-known URIs
   
3. Using this list, we can craft a script (well-known.py) to attempt to access all those URIs and return the responses to those requests,
which shows us **/.well-known/security.txt** is the only one found.

4. There, we can find the flag: **CSCPT{3thical_h4ck1ng_1s_aw3s0me}**