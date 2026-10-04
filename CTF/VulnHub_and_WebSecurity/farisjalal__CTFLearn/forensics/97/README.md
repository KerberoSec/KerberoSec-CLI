# 07601

### Prompt

https://mega.nz/#!CXYXBQAK!6eLJSXvAfGnemqWpNbLQtOHBvtkCzA7-zycVjhHPYQQ 

I think I lost my flag in there. Hopefully, it won't get attacked...

### Approach

- Running ```binwalk``` on the provided image file revealed loads of embedded files. Extracted all of them by running 
  ```binwalk --dd='.*' AGT.png```.

  [![https://imgur.com/XX9Rb2z.png](https://imgur.com/XX9Rb2z.png)](https://imgur.com/XX9Rb2z.png)

- Extracting the newly obtained zip file gave us another image.

  [![https://imgur.com/yzJz1GW.png](https://imgur.com/yzJz1GW.png)](https://imgur.com/yzJz1GW.png)  

- Examining the output of running ```strings``` on the newly obtained image file ```I Warned You.jpeg``` revealed the flag.

  [![https://imgur.com/gEAOiF8.png](https://imgur.com/gEAOiF8.png)](https://imgur.com/gEAOiF8.png)

- Flag obtained : ```ABCTF{Du$t1nS_D0jo}```
