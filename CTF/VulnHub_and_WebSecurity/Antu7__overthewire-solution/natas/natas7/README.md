# natas7

link-> https://overthewire.org/wargames/natas/natas7.html

## LEVEL GOAL

Username: natas7 <br>
Password: 7z3hEENjQtflzgnT29q7wAvMNfZdh0i9 <br>
URL:      http://natas7.natas.labs.overthewire.org <br>

## SOLUTION

On this level it seems we are provided with 2 links, Home and About. Let’s View Page Source, and see if we can find anything.
`hint: password for webuser natas8 is in /etc/natas_webpass/natas8`. Alright, the HTML comment is telling us that we can get the password from etc/natas_webpass/natas8. Judging by the hint, I assume this is a Directory Traversal Attack.

Access granted. The password for natas8 is `DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe`
