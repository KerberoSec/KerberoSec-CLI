# natas6

link-> https://overthewire.org/wargames/natas/natas6.html

## LEVEL GOAL

Username: natas6 <br>
Password: aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1 <br>
URL:      http://natas6.natas.labs.overthewire.org <br>

## SOLUTION

Alright, for this level we are to enter a secret, and the query should return the password… hopefully! Let ‘s go ahead and click View sourcedode and we should get the below PHP script.
It seems that the PHP is including a link to a file stored on the webpage /includes/secret.inc. Let’s go ahead and add that to the end of our URL, like so: http://natas6.natas.labs.overthewire.org/includes/secret.inc. We should come up to a blank webpage, so let’s View Page Source.

`<?
$secret = "FOEIUWGHFEEUHOFUOIU";
?>`

Access granted. The password for natas7 is `7z3hEENjQtflzgnT29q7wAvMNfZdh0i9`
