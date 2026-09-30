# Challenge Name:
 [*Keep it Simple*](https://cybertalents.com/challenges/forensics/keep-it-simple)
 
# Challenge Description
The answer is simple

Link: [http://35.225.187.108/Keep_it_Simple/](http://35.225.187.108/Keep_it_Simple/)

## Answer
* Open Inspector (ctrl + shift + c)
* Notice that there are two images with name 'the_eye.jpeg' one in img directory and the other in /www/html/ 
```html
<body>

<center>

	<h1>Restircted Area</h1>
	<h2>Provide the secret to enter the safe</h2>
	
	<form action="action.php" method="get">
  		<div class="container">
    		<label for="psw"><b>Password</b></label>
    		<input type="password" placeholder="Enter Password" name="password" required>
    		<button type="submit" name="submit">Login</button>
  		</div> 
	</form>
	</center>
	
	<center>
	<p>Forget Secret, Need 
		<a href="Hint.JPG">Hint
		</a>
	</p>
</center>
</body>
```
 * Downlaod them , then run 'diff' command to see if there is differance or not
```sh
└──╼ $ diff index.jpeg the_eye.jpeg 
Binary files index.jpeg and the_eye.jpeg differ
```
* Now we know that there is a differance between them let's see there meta data by using Exiftool
```bash
└──╼ $exiftool the_eye.jpeg 
ExifTool Version Number         : 12.23
File Name                       : the_eye.jpeg
Directory                       : .
File Size                       : 71 KiB
File Modification Date/Time     : 2021:04:16 04:03:50+01:00
File Access Date/Time           : 2021:04:16 04:03:50+01:00
File Inode Change Date/Time     : 2021:04:16 04:03:50+01:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
Image Width                     : 640
Image Height                    : 371
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 640x371
Megapixels                      : 0.237
```
 ```bash
└──╼ $exiftool the_eye.jpeg 
└──╼ $exiftool index.jpeg 
ExifTool Version Number         : 12.23
File Name                       : index.jpeg
Directory                       : .
File Size                       : 73 KiB
File Modification Date/Time     : 2021:04:16 04:08:56+01:00
File Access Date/Time           : 2021:04:16 03:33:13+01:00
File Inode Change Date/Time     : 2021:04:16 04:08:56+01:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
Exif Byte Order                 : Big-endian (Motorola, MM)
X Resolution                    : 72
Y Resolution                    : 72
Resolution Unit                 : inches
Y Cb Cr Positioning             : Centered
GPS Version ID                  : 2.3.0.0
GPS Latitude Ref                : North
GPS Longitude                   : 0 deg 0' 0.00"
GPS Altitude                    : 0 m
XMP Toolkit                     : XMP Core 5.6.0
Rights                          : {S1mpl3sty_i$_th_@nswer}
Current IPTC Digest             : 5e3e91b2890a2a0c1f69d828fd37bc26
Coded Character Set             : UTF8
Copyright Notice                : {S1mpl3sty_i$_th_@nswer}
Image Width                     : 640
Image Height                    : 371
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 640x371
Megapixels                      : 0.237
GPS Latitude                    : 0 deg 0' 0.00" N
GPS Position                    : 0 deg 0' 0.00" N, 0 deg 0' 0.00"
```
* You got the Flag, it is in the meta data of index.jpeg

 ## The Flag
 > S1mpl3sty_i$_th_@nswer
