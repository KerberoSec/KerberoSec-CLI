## HV19.01 censored

I got this little image, but it looks like the best part got censored on the way. Even the tiny preview icon looks clearer than this! Maybe they missed something that would let you restore the original content?

### Solution 

Exiftool shows that the image has a large thumbnail. Let's see if this is also censored. We can use mighty [ImageMagick](https://imagemagick.org/) to extract the thumbnail:

```bash
convert challenge.jpg thumbnail:thumb.jpg
```

**Flag:** HV19{just-4-PREview!}