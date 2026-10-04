# Blast from the past

## Description

The judge for these pictures is a real fan of antiques. Can you age this photo to the specifications?
Set the timestamps on this picture to 1970:01:01 00:00:00.001+00:00 with as much precision as possible for each timestamp. In this example, +00:00 is a timezone adjustment. Any timezone is acceptable as long as the time is equivalent. As an example, this timestamp is acceptable as well: 1969:12:31 19:00:00.001-05:00. For timestamps without a timezone adjustment, put them in GMT time (+00:00). The checker program provides the timestamp needed for each.
Use [this](https://artifacts.picoctf.net/c_mimas/90/original.jpg) picture.
Additional details will be available after launching your challenge instance.

## Solution

First, let's check the metadata of our picture using a tool called exiftool:

```shell
exiftool original.jpg
```

I then tried to modify the metadata of the picture using exiftool:

```shell
exiftool "-AllDates=1970:01:01 00:00:00.001" "-DateTimeOriginal=1970:01:01 00:00:00.001" "-CreateDate=1970:01:01 00:00:00.001" "-ModifyDate=1970:01:01 00:00:00.001" "-OffsetTime=+00:00" "-SubSecTimeOriginal=001" "-SubSecTimeDigitized=001" "-SubSecTime=001" original.jpg
```

this will pass all the tests and will apply all our desired modifications to the picture.

However, it will fail to change one last tag which is **Time Stamp**.

It looks like we're dealing with a proprietary Samsung tag within the image metadata that isn't part of the standard EXIF fields.

I tried many tools to change this but didn't get any results. eventually, I decided to change the hexadecimal code of the picture manually in order to modify this metadata tag.

I used ImHex for this task. at the end of the file, I found this line: UTC_Data1700513181420

I tried to make sense out of the numbers and realized it was our original Unix timestamp in milliseconds(2023:11:20 20:46:21.420+00:00).

Therefore, we need to convert our desired value(1970:01:01 00:00:00.001+00:00) to milliseconds and replace the previous value.

This Python code will do the trick for us.

the output is 1, so we modify our value to UTC_Data0000000000001.

flag: **picoCTF{71m3_7r4v311ng_p1c7ur3_83ecb41c}**
