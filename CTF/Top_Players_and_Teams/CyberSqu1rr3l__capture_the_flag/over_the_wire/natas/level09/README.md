```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%...............%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..............%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%...............%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%................%%...
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%...........%%....
........................................................................................................
```
Find the password for the user *natas9* to log in at
`http://natas9.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
Once again, we are prompted with an input bar to submit a secret to the query. Further,
we can view the source code which tells us exactly how the secret was encoded, along with
the encoded hash.

```php
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
```
So, it becomes our objective to decode the secret by reversing the three encoding
operations one after another. On our machine, we can enter the interactive PHP mode
with `php -a`, which we can installed with `apt install php7.4-cli` or
similar. In the PHP console, we enter
`echo base64_decode(strrev(hex2bin('3d3d516343746d4d6d6c315669563362')));`
to obtain the secret, which we can then input to the website to get the password for
*natas9*.

[^1]: https://overthewire.org/wargames/natas/natas9.html
