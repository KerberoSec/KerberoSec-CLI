# Natas Level 6
The ***URL*** to which you need to connect is *http://natas6.natas.labs.overthewire.org*. The ***username*** is *natas6* and the ***password*** is *aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1*. 

1. Click [View sourcecode](http://natas6.natas.labs.overthewire.org/index-source.html)
```php
<?
include "includes/secret.inc";

    if(array_key_exists("submit", $_POST)) {
        if($secret == $_POST['secret']) {
        print "Access granted. The password for natas7 is <censored>";
    } else {
        print "Wrong secret";
    }
    }
?>
```
2. lets see what's in : http://view-source:natas6.natas.labs.overthewire.org/includes/secret.inc

```php
<?
$secret = "FOEIUWGHFEEUHOFUOIU";
?>
```

3. lets enter in the input : FOEIUWGHFEEUHOFUOIU

```
Access granted. The password for natas7 is 7z3hEENjQtflzgnT29q7wAvMNfZdh0i9 
```

