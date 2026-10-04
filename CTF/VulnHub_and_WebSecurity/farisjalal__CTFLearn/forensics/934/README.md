# Snowboard

### Prompt

Find the flag in the jpeg file. Good Luck!\
\
https://ctflearn.com/challenge/download/934

### Approach

- The prompt didn't help too much, so I started out by running 'exiftool' on the provided file since it was an image, and the flag might be hidden in the metadata.

  [![https://imgur.com/FkgegRd.png](https://imgur.com/FkgegRd.png)](https://imgur.com/FkgegRd.png)
- I found a flag, but it was a fake. Rest of the metadata didn't help too much, so I moved on.

- Running 'strings' on the image revealed the same fake flag, followed by a large alphanumeric string, that ended with '==', which generally is padding added to a base64 encoded string.

  [![https://imgur.com/PcQu6eu.png](https://imgur.com/PcQu6eu.png)](https://imgur.com/PcQu6eu.png)
- Decoding the string using a base64 decoder (https://www.base64decode.org/), I found the real flag.

  [![https://imgur.com/PyJOQgY.png](https://imgur.com/PyJOQgY.png)](https://imgur.com/PyJOQgY.png)
- Flag obtained : ```CTFlearn{SkiBanff}```

