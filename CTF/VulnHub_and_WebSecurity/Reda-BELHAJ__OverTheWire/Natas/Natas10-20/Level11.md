# Natas Level 11
The ***URL*** to which you need to connect is *http://natas11.natas.labs.overthewire.org*. The ***username*** is *natas11* and the ***password*** is *U82q5TCMMQ9xuFoI3dYX61s7OZD9JKoK*. 

Lets check the [viewsource](http://natas11.natas.labs.overthewire.org/index-source.html) link.
```php
<?
$defaultdata = array( "showpassword"=>"no", "bgcolor"=>"#ffffff");

function xor_encrypt($in) {
    $key = '<censored>';
    $text = $in;
    $outText = '';

    // Iterate through each character
    for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $key[$i % strlen($key)];
    }

    return $outText;
}

function loadData($def) {
    global $_COOKIE;
    $mydata = $def;
    if(array_key_exists("data", $_COOKIE)) {
    $tempdata = json_decode(xor_encrypt(base64_decode($_COOKIE["data"])), true);
    if(is_array($tempdata) && array_key_exists("showpassword", $tempdata) && array_key_exists("bgcolor", $tempdata)) {
        if (preg_match('/^#(?:[a-f\d]{6})$/i', $tempdata['bgcolor'])) {
        $mydata['showpassword'] = $tempdata['showpassword'];
        $mydata['bgcolor'] = $tempdata['bgcolor'];
        }
    }
    }
    return $mydata;
}

function saveData($d) {
    setcookie("data", base64_encode(xor_encrypt(json_encode($d))));
}

$data = loadData($defaultdata);

if(array_key_exists("bgcolor",$_REQUEST)) {
    if (preg_match('/^#(?:[a-f\d]{6})$/i', $_REQUEST['bgcolor'])) {
        $data['bgcolor'] = $_REQUEST['bgcolor'];
    }
}

saveData($data);
?>
```
So we see that the data cookie are like (json array): the default data {"showpassword":"no","bgcolor":"#ffffff"}, Lets try to encode this array {"showpassword":"yes","bgcolor":"#ffffff"} instead and pass it through using burp.

![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture2.PNG)
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture4.PNG)
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture3.PNG)
```
The password for natas12 is EDXp0pS26wLKHZy1rDBPUZk0RKfLGIR3
```
