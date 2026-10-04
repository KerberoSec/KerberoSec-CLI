# Exclusive Santa

### Prompt

Hey! There are so many toys that I want, but I just don't have the money. I don't care which toy I get as long as it's one or the other, but not both!

https://ctflearn.com/challenge/download/851

### Approach

- I began by extracting the provided ```.rar``` file using ```unrar```. 2 PNGs were extracted.

  [![https://imgur.com/nQ1T8Qe.png](https://imgur.com/nQ1T8Qe.png)](https://imgur.com/nQ1T8Qe.png)

- Running ```exiftool``` on both the images did not reveal much. Running ```binwalk``` on them revealed a hidden image embedded in the second image. I then extracted it using the following command

  [![https://imgur.com/2d63vXf.png](https://imgur.com/2d63vXf.png)](https://imgur.com/2d63vXf.png)

  ```binwalk --dd='.*' 3.png```

  [![https://imgur.com/cx9JG0S.png](https://imgur.com/cx9JG0S.png)](https://imgur.com/cx9JG0S.png)

- At this point, I was slightly stuck. I noticed that the first distorted image (1.png) and the hidden image (CCB6) we found later were pretty similar, so I researched that a bit. Turns out a common way to hide certain things is by layering images, which is probably what has happened here.

- Some more research revealed that '[Stegsolve](http://www.caesum.com/handbook/stego.htm)' is a useful tool that lets us deal with problems of this kind. So I got it and played with it a bit. 

- I went through the options in the 'Analyse' drop down menu. 'Frame browser' somehow displayed the clean White Walker(I'm guessing, haven't actually watched GoT lol), but wasn't very helpful. 'Image combiner' was the only tool left.

- I tried combining the distorted image(1.png) with the newly extracted image that looked like a Venn Diagram (0), and surprisingly, it worked! The result was a mirrored image with the flag.

  [![https://i.imgur.com/XSuaCh8.png](https://i.imgur.com/XSuaCh8.png)](https://i.imgur.com/XSuaCh8.png)

  [![https://imgur.com/F2vn3e1.png](https://imgur.com/F2vn3e1.png)](https://imgur.com/F2vn3e1.png)

  [![https://imgur.com/ShABg6e.png](https://imgur.com/ShABg6e.png)](https://imgur.com/ShABg6e.png)

- This was my first challenge of this kind, and I haven't yet fully understood the powers at play, but it was interesting. I'll definitely be revisiting this sort of challenge, and Stegsolve, the tool.

- Flag obtained : ```CTFLearn{Santa_1s_C0ming}```
