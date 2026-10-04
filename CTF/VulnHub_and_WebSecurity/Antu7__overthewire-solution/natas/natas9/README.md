# natas9

link-> https://overthewire.org/wargames/natas/natas9.html

## LEVEL GOAL

Username: natas9 <br>
Password: W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl <br>
URL:      http://natas9.natas.labs.overthewire.org <br>

## SOLUTION

After login, we see there is an Input secret, and its Find words containing simple Dicsonary search input find. Also, there is a View sourcecode file so let's jump in. in that source code, we see there is a `dictionary.txt` file matching code written in PHP. So let's check if the system is command-line injection enable or not.

First, try `; ls;` bingo. It shows all file output in that path. <br>

Now we can see the system is command-line injection enable.  <br>

So after try `; info;` this we understand it's a UNIX os.

Lets try `;cat /etc/natas_webpass/natas10;`.

And here we go system return

`nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu` <br>

Access granted. The password for natas9 is `nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu`