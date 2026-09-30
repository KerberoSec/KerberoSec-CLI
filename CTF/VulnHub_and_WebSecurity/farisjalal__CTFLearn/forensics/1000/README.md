# abandoned place

### Prompt

the flag is outside of the pic, try to find it. another hint: dimensions, dimensions, everything is in dimensions.\
\
https://ctflearn.com/challenge/download/1000

### Approach
- Initially had no idea how to approach the problem. Viewing the image and its metadata directly revealed nothing particularly interesting.

  [![https://imgur.com/oAJJcfx.png](https://imgur.com/oAJJcfx.png)](https://imgur.com/oAJJcfx.png)

- I then re-read the prompt and decided to re-examine the metadata, paying close attention to the image's dimensions.

  [![https://imgur.com/6R9UUmq.png](https://imgur.com/6R9UUmq.png)](https://imgur.com/6R9UUmq.png) 

- I noticed that the x and y resolutions suggested that the image had an aspect ratio of 1:1, but the image dimensions field said ```2016x900```

- I spent some time researching this oddity, and discovered that a common way to hide information is to modify the dimensions of the image by manually editing its hex values. 

- It was my first time attempting this kind of manipulation, so I followed some tutorials to identify the right hex values (https://www.quora.com/How-do-I-extract-width-and-height-data-from-an-Exif-JPG-hex-format-in-C++).

  [![https://imgur.com/ejDQpIC.png](https://imgur.com/ejDQpIC.png)](https://imgur.com/ejDQpIC.png)

- Use ```hexedit``` to do the same. Looking for the relevant bytes, we find the following:

  [![https://imgur.com/zCbIn4G.png](https://imgur.com/zCbIn4G.png)](https://imgur.com/zCbIn4G.png)

- To convert the dimensions to a 1:1 aspect ratio, I had to convert 2016x900 into 2016x2016. Replacing the hex for 900(0384) with that of 2016(07E0).

  [![https://imgur.com/wzZcEXr.png](https://imgur.com/wzZcEXr.png)](https://imgur.com/wzZcEXr.png)

- On saving and viewing the modified image, we can now see the hidden flag.

  [![https://imgur.com/LWyV5nF.png](https://imgur.com/LWyV5nF.png)](https://imgur.com/LWyV5nF.png)

- Flag obtained : ```urban_exploration```
