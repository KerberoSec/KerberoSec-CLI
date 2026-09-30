# Challenge Name:
 [*This is Sparta*](https://cybertalents.com/challenges/web/this-is-sparta)
 
# Challenge Description
Morning has broken today they're fighting in the shade when arrows blocked the sun they fell tonight they dine in hell

Link: [http://35.193.45.56/sparta/](http://35.193.45.56/sparta/)

## Answer
* Open Inspector (ctrl + shift + c)
* Scroll down there is script element which is ASCII conveted to Hexa:
```html
var _0xae5b=["\x76\x61\x6C\x75\x65","\x75\x73\x65\x72","\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x42\x79\x49\x64","\x70\x61\x73\x73", 
"\x43\x79\x62\x65\x72\x2d\x54\x61\x6c\x65\x6e\x74",
"\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x43\x6F\x6E\x67\x72\x61\x74\x7A\x20\x0A\x0A",
"\x77\x72\x6F\x6E\x67\x20\x50\x61\x73\x73\x77\x6F\x72\x64"];
function check(){var _0xeb80x2=document[_0xae5b[2]](_0xae5b[1])[_0xae5b[0]];
var _0xeb80x3=document[_0xae5b[2]](_0xae5b[3])[_0xae5b[0]];
if(_0xeb80x2==_0xae5b[4]&&_0xeb80x3==_0xae5b[4]){
  alert(_0xae5b[5]);
 } else {
 alert(_0xae5b[6]);
 }
 }
```
* Convet it to ASCII
```html
var a=["value","user","getElementById","pass","Cyber-Talent" ,"Congratz", "wrong Password"];
function check(){
  var b=document[a[2]](a[1])[a[0]];
  var c =document[a[2]](a[3])[a[0]];
  if(b == a[4] && c ==a[4]){
      alert(a[5]);
   }else {
      alert(a[6]);
   }
 }
 ```
 * From JavaScript code He compare username and password with a[4]="Cyber-Talent"
 * You Got the Flag!!
 
 
 ## The Flag
 > J4V4_Scr1Pt_1S_Aw3s0me
