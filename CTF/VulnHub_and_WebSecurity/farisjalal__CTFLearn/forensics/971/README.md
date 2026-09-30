# Pho Is Tasty!

### Prompt

The flag is hidden in the jpeg file. Good Luck! Have some Pho! Solve this challenge before solving my Scope challenge for 100 points.
\
\
https://ctflearn.com/challenge/download/971

### Approach
- As the given file was an image, I first tried using ```exiftool``` and ```strings```, but it didn't prove useful.

- Create hex dump by running
  ```
  hexdump -C Pho.jpg
  ```
  [![https://imgur.com/MxsNElN.png](https://imgur.com/MxsNElN.png)](https://imgur.com/MxsNElN.png)

- Cleaning up the observed string gave me the flag.

- Flag obtained : ```CTFlearn{I_Love_Pho!!!}```
