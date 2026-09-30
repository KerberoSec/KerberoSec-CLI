# natas8

link-> https://overthewire.org/wargames/natas/natas8.html

## LEVEL GOAL

Username: natas8 <br>
Password: DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe <br>
URL:      http://natas8.natas.labs.overthewire.org <br>

## SOLUTION

After login we see there is an Input secret: section and a submit button. So we need to submit the secret but wait do we know any secret? Let's jump into the View source code they provide.

```
<?
$encodedSecret = "3d3d516343746d4d6d6c315669563362";

function encodeSecret($secret) {
    return bin2hex(strrev(base64_encode($secret)));
}

if(array_key_exists("submit", $_POST)) {
    if(encodeSecret($_POST['secret']) == $encodedSecret) {
    print "Access granted. The password for natas9 is <censored>";
    } else {
    print "Wrong secret";
    }
}
?>
```
So Forunately, we are able to get the algorithim used to encrypt the secret we need to input. We can see that on line 2 we have an encoded secret. So now we have to reverse the encodeSecret function to pass this level. So in order to reverse the code we need to take the encodedSecret from line 2 and pass it through a decoding sequence that does the following:

So here is our PHP code

```
<?php
function decodeSecret($secret){
  return base64_decode(strrev(hex2bin($secret)));
  }
  
print "The secret is: "; 
print decodeSecret("3d3d516343746d4d6d6c315669563362");
print "\n";
?>
```

Note that first we transform the secret into binary, because the last operation was to transform to hex. Next, we reverse the binary string. Last, we have to base64 decode the string. Our resulting output is `oubWYf2kBq`. When we place the decoded output into the web text box and click submit. Bingo!

Access granted. The password for natas9 is `W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl`