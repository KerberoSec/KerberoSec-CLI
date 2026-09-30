# **Confidential**
___
### *[Image: DaBaby]* Lesss goooo *[Image: DaBaby]*
___
#### Finding What to do:
If you read the description, you will see we are given a **pdf** file to work with.
That **pdf** file has a **QR** code on it but covered with another image.

**Our main objective is to extract that QR CODE and Find the Flag**

***First*** let's try to see what we have inside that **pdf** file.
For that, we will use **`pdfinfo`**. But as you can see, there is not much *useful* information here.
Let's try **`strings`** which will show us some *interesting* information about the file.
here's the part:
```strings
    << /Length 17 0 R
   /Filter /FlateDecode
   /Type /XObject
   /Subtype /Image
   /Width 187
   /Height 169
   /ColorSpace /DeviceRGB
   /Interpolate true
   /BitsPerComponent 8
   /SMask 15 0 R

```
As you can see there is an image here.

***Now*** let's try to extract that image from **pdf**.
For that we will use **`pdfimages`** tool.
Use command
> ```bash
> pdfimages -all the_pdf_file.pdf /location/to/save/images
>  ```

>>>***N.B***: you also can use `pdfimages -list the_pdf_file.pdf` to see all the available images in that **pdf** file.
>>> output should be something like this:
>>>``` 
>>>page   num  type   width height color comp bpc  enc interp  object ID x-ppi y-ppi size ratio
>>>--------------------------------------------------------------------------------------------
>>>   1     0 image     850  1100  gray    1   8  image  yes       10  0    73    73 85.7K 9.4%
>>>   1     1 image     187   169  rgb     3   8  image  yes       13  0    73    73 9060B 9.6%
>>>   1     2 smask     187   169  gray    1   8  image  yes       13  0    73    73 3150B  10%
>>>```

After executing the command, you will see 3 images extracted from the **pdf** in the directory you gave.

One contains the **QR** code. 

Now get your **a$$** out there and scan it and then submit the **flag**. 
*As simple as zat.*

Here's an **Obunga** for you

