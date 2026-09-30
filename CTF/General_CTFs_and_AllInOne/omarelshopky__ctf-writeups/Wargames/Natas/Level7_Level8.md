# Natas Level 7 --> Level 8

**Username:** natas8

**Password:** DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe

**URL:**      http://natas8.natas.labs.overthewire.org

## Solution
* Open inspect, there is textbox take a code and button send as to page contain source code lets see it
* In this page page it is obvious that what we will write in previous textbox will be encoded then compare to code stored in "encodedSecret"
* We must decode this pass to know what we should write, he encode ours in this steps:
  1. base64
  2. reverse the string
  3. convert from binary to hexa
* So we must do it in reverse lets convert it from hexa to binary (PHP)
```php
<?php
echo hex2bin("3d3d516343746d4d6d6c315669563362");
?>
```
* Reverse the String (Python)
```python
code = " ==QcCtmMml1ViV3b"[::-1]
print(code)
```
* Decode base64 (Linux command)
```bash
echo b3ViV1lmMmtCcQ==  | base64 -d
```
* Submit it the password will appear

*you can decode it in sample way as follow*
```php
<?php
  encodedSecret = "3d3d516343746d4d6d6c315669563362";
  echo base64_decode(strrev(hex2bin($encodedSecret)));
?>
```

## Natas9 Password
> W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl

