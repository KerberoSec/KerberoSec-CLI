# Up For A Little Challenge?

### Prompt

https://mega.nz/#!LoABFK5K!0sEKbsU3sBUG8zWxpBfD1bQx_JY_MuYEWQvLrFIqWZ0

You Know What To Do...

### Approach

- Ran ```strings``` on the image, it revealed a bunch of potentially useful information, including a link to another hosted file.

  [![https://imgur.com/Z9gcp2t.png](https://imgur.com/Z9gcp2t.png)](https://imgur.com/Z9gcp2t.png)

  [![https://imgur.com/7zj046v.png](https://imgur.com/7zj046v.png)](https://imgur.com/7zj046v.png)

- The new file  was a zip file. On extracting it, after wasting my time on the provided image, I found a hidden file by running ```ls -a```. This seemed to be another zip file, but password protected.

  [![https://imgur.com/VbmBW81.png](https://imgur.com/VbmBW81.png)](https://imgur.com/VbmBW81.png)

- This challenge had a lot of misdirection, but unzipping the hidden file with the 'real' password from running ```strings``` earlier gave us an image.

  [![https://imgur.com/mm8AD8n.png](https://imgur.com/mm8AD8n.png)](https://imgur.com/mm8AD8n.png)

- The flag can be observed in the corner of the image, in tiny font.

  [![https://imgur.com/t77u24e.png](https://imgur.com/t77u24e.png)](https://imgur.com/t77u24e.png)

- Flag obtained : ```flag{hack_complete}```
