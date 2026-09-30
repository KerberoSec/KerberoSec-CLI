## Challenge 🧩

The judge for these pictures is a real fan of antiques. Can you age this photo to the specifications?
Set the timestamps on this picture to 1970:01:01 00:00:00.001+00:00 with as much precision as possible for each timestamp. In this example, +00:00 is a timezone adjustment. Any timezone is acceptable as long as the time is equivalent. As an example, this timestamp is acceptable as well: 1969:12:31 19:00:00.001-05:00. For timestamps without a timezone adjustment, put them in GMT time (+00:00). The checker program provides the timestamp needed for each.

Author: SYREAL</br>
Points: 300

Hint: Exiftool is really good at reading metadata, but you might want to use something else to modify it.

## Solution 🕵️‍♂️

We need to change timestamps on the given picture to 1970:01:01 00:00:00.001+00:00

```bash
┌──(user㉿shell)-[~]
└─$ exiftool -AllDates="1970:01:01 00:00:00.001+00:00" original.jpg
```

Next we need to change Sub-Second from 703 to 001

```bash
┌──(user㉿shell)-[~]
└─$ exiftool -SubsecTime="001" original.jpg

┌──(user㉿shell)-[~]
└─$ exiftool -SubsecTimeDigitized="001" original.jpg

┌──(user㉿shell)-[~]
└─$ exiftool -SubsecTimeOriginal="001" original.jpg
```

Since the image is taken by Samsung device, the device adds `Samsung Makernotes tag` and stores date and time in UNIX Timestamp format.

```bash
┌──(user㉿shell)-[~]
└─$ exiftool -v original.jpg
  ...
  Samsung trailer (143 bytes at offset 0x2b83ca):
    SamsungTrailer_0x0a01Name = Image_UTC_Data
    TimeStamp = 1700513181420
    SamsungTrailer_0x0aa1Name = MCC_Data
    MCCData = 310
    SamsungTrailer_0x0c61Name = Camera_Capture_Mode_Info
    SamsungTrailer_0x0c61 = 1
```

So exiftool was unable to modify the `TimeStamp` tag. We have to use hexeditor.

```text
1700513181420 to 0000000000001

31 37 30 30 35 31 33 31 38 31 34 32 30  to  30 30 30 30 30 30 30 30 30 30 30 30 31
```

Checking image

```shell
┌──(user㉿shell)-[~]
└─$ nc -w 2 mimas.picoctf.net XXXXX < original_modified.jpg

┌──(user㉿shell)-[~]
└─$ nc mimas.picoctf.net XXXXX 
MD5 of your picture:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  test.out

Checking tag 1/7
Looking at IFD0: ModifyDate
Looking for '1970:01:01 00:00:00'
Found: 1970:01:01 00:00:00
Great job, you got that one!

Checking tag 2/7
Looking at ExifIFD: DateTimeOriginal
Looking for '1970:01:01 00:00:00'
Found: 1970:01:01 00:00:00
Great job, you got that one!

Checking tag 3/7
Looking at ExifIFD: CreateDate
Looking for '1970:01:01 00:00:00'
Found: 1970:01:01 00:00:00
Great job, you got that one!

Checking tag 4/7
Looking at Composite: SubSecCreateDate
Looking for '1970:01:01 00:00:00.001'
Found: 1970:01:01 00:00:00.001
Great job, you got that one!

Checking tag 5/7
Looking at Composite: SubSecDateTimeOriginal
Looking for '1970:01:01 00:00:00.001'
Found: 1970:01:01 00:00:00.001
Great job, you got that one!

Checking tag 6/7
Looking at Composite: SubSecModifyDate
Looking for '1970:01:01 00:00:00.001'
Found: 1970:01:01 00:00:00.001
Great job, you got that one!

Checking tag 7/7
Timezones do not have to match, as long as it's the equivalent time.
Looking at Samsung: TimeStamp
Looking for '1970:01:01 00:00:00.001+00:00'
Found: 1970:01:01 00:00:00.001+00:00
Great job, you got that one!

You did it!
picoCTF{71m3_7r4v311ng_p1c7ur3_xxxxxxxx}
```

## Flag 🚩

`picoCTF{71m3_7r4v311ng_p1c7ur3_xxxxxxxx}`
