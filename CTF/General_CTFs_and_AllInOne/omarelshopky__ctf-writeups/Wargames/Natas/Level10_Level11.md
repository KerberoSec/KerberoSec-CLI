# Natas Level 10 --> Level 11

**Username:** natas11

**Password:** U82q5TCMMQ9xuFoI3dYX61s7OZD9JKoK 

**URL:**      http://natas11.natas.labs.overthewire.org

## Solution
* Open inspect, there is textbox take a background color code and button send us to a page contain source code lets see it
* In this page it takes cookies decrypt it to get data in this temp "array( "showpassword"=>"no", "bgcolor"=>"#ffffff")", if showpassword was yes next level pass will appear
* He encrypt data in three ways xor, json and base64, for xor we want to know the key to submit our data
* Now we have:
  1. default data = array( "showpassword"=>"no", "bgcolor"=>"#ffffff")
  2. default encrypted = cookies *(we can get it using Burbsuite or from inspect below storage)*
  3. the key is missing 
* If we do xor encrypt with default data and default encrypted we will get the key 
```php
<?php
$default = array( "showpassword"=>"no", "bgcolor"=>"#ffffff");
$default = json_encode($default);

$defaultencrypt = "ClVLIh4ASCsCBE8lAxMacFMZV2hdVVotEhhUJQNVAmhSRwh6QUcIaAw%3D";
$defaultencrypt = base64_decode($defaultencrypt);
 
function xor_encrypt($in, $key) {
    $text = $in;
    $outText = '';

    // Iterate through each character
    for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $key[$i % strlen($key)];
    }

    return $outText;
}

$key = xor_encrypt($default, $defaultencrypt);
echo $key
?>
```
* It will return "qw8Jqw8Jqw8Jqw8Jqw8Jqw8J" so we can say that key = "qw8J", now with the same function as source code lets encrypt our cookies
```php
<?php

function xor_encrypt($in) {
    $key = 'qw8J';
    $text = $in;
    $outText = '';

    // Iterate through each character
    for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $key[$i % strlen($key)];
    }

    return $outText;
}

$data = array( "showpassword"=>"yes", "bgcolor"=>"#ffffff");

$cookies =  base64_encode(xor_encrypt(json_encode($data)));

echo $cookies;
?>
```
* Submit this cookies from Burbsuite or storage
* This is the password

## Natas12 Password
>  EDXp0pS26wLKHZy1rDBPUZk0RKfLGIR3

