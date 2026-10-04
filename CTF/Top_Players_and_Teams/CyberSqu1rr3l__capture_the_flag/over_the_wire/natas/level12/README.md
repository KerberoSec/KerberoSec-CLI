```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%.....%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%........%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%.....%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%....%%.....
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%..%%%%%%.
..............................................................................................................
```
Find the password for the user *natas12* to log in at
`http://natas12.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
The *natas11* website informs us, that cookies are protected with XOR encryption and
gives us an input form to set the background color. Therefore, we investigate the GET
request as it was sent and discover a `data` request cookie which is decoded as a JSON
object in the `loadData` function. According to the source code, we can see how this
cookie is decoded using *Base64* and then *XORed* in `xor_encrypt`. In case the JSON
object is a valid array and contains both the `showpassword` and `bgcolor` fields, it is
being used to overwrite the default values. Since XOR encoding is vulnerable to
known-plaintext attacks, we can get the key from knowing the ciphertext, simply because
`plaintext XOR ciphertext = key` holds valid. It is our goal now to figure out the key,
so that we can re-encode the data with a manipulated cookie value, i.e. setting the
`showpassword` parameter to "yes".
First, we want to obtain the old cookie value by retrieving it from the *storage* tab in
the developer tools. Then, we want to adjust the cookie value to match it in the PHP
script and run it with `php -f obtain_key_and_cookie.php`. This PHP script calculates
the key by using the cookie value and the known plaintext array value with a white
background and a deactivated `showpassword` variable. Having obtained this repeated
key string, we then want to filter the repeated part and encrypt a new cookie value
with an activated `showpassword` array value.
Finally, we can exchange this calculated cookie with the old cookie value either in the
*storage* tab or in the console, with `document.cookie` and refresh for the password.

[^1]: https://overthewire.org/wargames/natas/natas12.html
