# Natas Level 8
The ***URL*** to which you need to connect is *http://natas8.natas.labs.overthewire.org*. The ***username*** is *natas8* and the ***password*** is *DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe*. 

Lets check the [viewsource](http://natas8.natas.labs.overthewire.org/index-source.html) link.
```php
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

Lets try decode the secret using Python and the reverse of the function "encodeSecret":
```python
import binascii, base64

key     = "3d3d516343746d4d6d6c315669563362"
print( base64.b64decode( binascii.unhexlify(key)[::-1]))
```

And Enter the output "oubWYf2kBq":
```
Access granted. The password for natas9 is W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl
```
