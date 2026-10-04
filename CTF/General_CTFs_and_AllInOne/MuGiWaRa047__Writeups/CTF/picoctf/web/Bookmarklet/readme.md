# Bookmarklet

### Desccription :
Why search for the flag when I can make a bookmarklet to print it for me?
Browse http://titan.picoctf.net:51811/, and find the flag!

## Solution

Browse the given link, in website we have to do is just run the given script in bookmarklet, we can not edit it and we can not even run that script directly.

<details>
<summary markdown="span">given script in bookmarklet : </summary>
```
        javascript:(function() {
            var encryptedFlag = "àÒÆÞ¦È¬ëÙ£ÖÓÚåÛÑ¢ÕÓÒËÉ§©í";
            var key = "picoctf";
            var decryptedFlag = "";
            for (var i = 0; i < encryptedFlag.length; i++) {
                decryptedFlag += String.fromCharCode((encryptedFlag.charCodeAt(i) - key.charCodeAt(i % key.length) + 256) % 256);
            }
            alert(decryptedFlag);
        })();
```
                                
</details>

what if still we want to run that script, is there any other way ?

yes we can use ' console ' (inspect >> console)

Just go tu the console and past the given script and you will get flag in alert:

#### flag :   picoCTF{p@g3_turn3r_6bbf8953}