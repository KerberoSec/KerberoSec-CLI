## Irish-Name-Repo 1

[Link to challenge](https://play.picoctf.org/practice/challenge/80)

Write-up:

1. Looking at the Support page in the web application, there is a hint towards SQLi.
We probably need to login as admin to solve the challenge. Attempting credentials
`':a` returns an Internal Server Error, which is a good indicator for SQLi.

2. Attempting `admin'-- :a` successfully logs us in as `admin` and gets us the flag:
**picoCTF{s0m3_SQL_f8adf3fb}**