```
   ___  __ __  ____  _____                 ___ ___    ___ ______   ____  ___     ____  ______   ____ 
  /  _]|  |  ||    ||     |               |   |   |  /  _]      | /    ||   \   /    ||      | /    |
 /  [_ |  |  | |  | |   __|     _____     | _   _ | /  [_|      ||  o  ||    \ |  o  ||      ||  o  |
|    _]|_   _| |  | |  |_      |     |    |  \_/  ||    _]_|  |_||     ||  D  ||     ||_|  |_||     |
|   [_ |     | |  | |   _]     |_____|    |   |   ||   [_  |  |  |  _  ||     ||  _  |  |  |  |  _  |
|     ||  |  | |  | |  |                  |   |   ||     | |  |  |  |  ||     ||  |  |  |  |  |  |  |
|_____||__|__||____||__|                  |___|___||_____| |__|  |__|__||_____||__|__|  |__|  |__|__|
```
Our sad friend pepo got lost! Can you find where he is? The password is the city where
pepo is located. [^1]

Solution
-----------------------------------------------------------------------------------------
Since the challenge is referencing the Wikipedia article to Metadata [^2], we use the
CLI tool `exiftool` to read the meta information from the challenge file `ch1.png`.
```
$ exiftool ch1.png 
ExifTool Version Number         : 11.88
File Name                       : ch1.png
Directory                       : .
File Size                       : 13 kB
<--snip-->
Exif Byte Order                 : Big-endian (Motorola, MM)
Image Description               : S0rry_N0_Gu3ss1ng_Gh1zm0!
Resolution Unit                 : inches
Y Cb Cr Positioning             : Centered
Exif Version                    : 0232
Components Configuration        : Y, Cb, Cr, -
Flashpix Version                : 0100
Owner Name                      : ISISTM
GPS Latitude Ref                : North
GPS Longitude Ref               : East
Image Size                      : 96x96
Megapixels                      : 0.009
GPS Latitude                    : 43 deg 17' 56.27" N
GPS Longitude                   : 5 deg 22' 49.38" E
GPS Position                    : 43 deg 17' 56.27" N, 5 deg 22' 49.38" E
```
Note, that we are now interested in the location, to find out the city where Pepo is
hiding. To get a map that shows the location of the GPS coordinates, we can use an
online tool, like GPS coordinates [^3] to then enter the decimal degrees, minutes and
seconds in the DMS field. The resulting city which is also the validation for this
challenge can be thus identified to be *Marseille*.

[^1]: https://www.root-me.org/en/Challenges/Steganography/EXIF-Metadata
[^2]: https://en.wikipedia.org/wiki/Metadata
[^3]: https://www.gps-coordinates.net/
