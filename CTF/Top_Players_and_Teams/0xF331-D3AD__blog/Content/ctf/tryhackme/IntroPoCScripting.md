# Intro PoC Scripting

In this room we'll explore the basics of exploit development, read metasploit
source code and exploit Webmin 1.580 (CVE-2012-2982)

---

## *Example: the starting point*

All answers to this one can be found in the room intro:

- What is the target's platform and version number?

> Webmin 1.580

- What is the associated CVE for this platform?

> CVE-2012-2982

- Which file does the vulnerability exist in?

> file/show.cgi

- What program/command would be the most effective to use in this exploit?

> system shell

---

## *Translating Metasploit module code*

For this part we'll need to look at the [Metasploit version of exploit](https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/unix/webapp/webmin_show_cgi_exec.rb)

- What's the original disclosure date of this exploit?

> September 6 2012

- What HTTP response code do we expect after the initial POST request?

> 302

- What does sid stand for and what is it's purpose?

> session id, authentication

- In the check function, what is it doing to the cookies?

> format

- In the second request of the check function, what method is piped into the command?

> rand_text_alphanumeric

---

## *Converting Ruby to Python*

Actually, just for fun I've converted it to Java. You can check out [the Java version here](https://github.com/0xF331-D3AD/CVE-2012-2982.git).

- Which HTTP response header allows us to send an authenticated POST request?

> Set-Cookie

- Which is the correct method for formatting cookies in this example?

> any

- What data type does the payload need to be?

> string

- Why do we need to use "bash -c exec" instead of just "bash -i"
 
> replaces current shell process

- What is the purpose of "<&1" in the payload function?

> redirects socket output stream to bash input stream

---

## *Final exploit and test*

Just use whatever exploit provided, you'll get root access right away.
