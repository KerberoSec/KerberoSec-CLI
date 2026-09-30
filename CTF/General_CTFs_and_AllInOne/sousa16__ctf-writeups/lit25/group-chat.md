  
**NOTE: This is a post-solution writeup, created after reviewing the official solution/other players’ approaches. 
It’s for learning and documentation.**

Write-up:

1. After reviewing the source code, we notice a Jinja2 template is being used. We can't use `{ }` in the username, but we can use one of them.

2. Using `{{ 7*7` as the username and the sending a message returns Internal Server Error, which indicates SSTI: *this was as far as I got during the CTF*.

3. After reviewing other players' approaches, I saw we could close the curly braces using a second username, in order to fix the Internal Server error and create a valid SSTI payload:

    `username1: {{config.__class__.__init__.__globals__['os'].popen('cat flag.txt').read() ~'ss`

    `username2: '}}`

4. Sending this payload manually returns 500, so we can use a script to avoid it: `group-chat.py`.
This displays the flag: `LITCTF{1m_g0nn4_h4v3_t0_d0_m0r3_t0_5t0p_7he_1n3v1t4bl3_f0rw4rd_br4c3_f0rw4rd_br4c3_b4ckw4rd_br4c3_b4ckw4rd_br4c3}`

## Lessons Learned

- **Local debugging is crucial**: Setting up a local replica of the vulnerable application helps understand the exploit mechanism and test payloads safely
- **String concatenation for payload splitting**: The `~'ss'` concatenation trick allows splitting SSTI payloads across multiple inputs to bypass basic filtering
- **Automation avoids manual errors**: Using a script to send the two-part payload prevents Internal Server Errors that occur when manually setting usernames and ensures proper timing/session handling
