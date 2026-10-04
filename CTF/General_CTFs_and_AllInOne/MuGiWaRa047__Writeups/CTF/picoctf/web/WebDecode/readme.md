# WebDecode

### Desccription :
Do you know how to use the web inspector?
Start searching `http://titan.picoctf.net:54494/` to find the flag

## Solution

As the name is 'WebDecode' we can assume that this is something about decoding. first check websites sourcecode if there is something usefull. website has three pages 'home' , 'about' , 'contact'.

in about page inside the sourcecode when we look closer there is a string looks like some type of encoding

```html

  <section class="about" notify_true="cGljb0NURnt3ZWJfc3VjYzNzc2Z1bGx5X2QzYzBkZWRfMWY4MzI2MTV9">

```

' cGljb0NURnt3ZWJfc3VjYzNzc2Z1bGx5X2QzYzBkZWRfMWY4MzI2MTV9 ' this is base64 encoding, we have to decode it frome base64. for decode it we can use `https://gchq.github.io/CyberChef/`

simply past the encoded string in CyberCheff and decode frome Base64 and we will get the flag.

#### flag :   picoCTF{web_succ3ssfully_d3c0ded_1f832615}