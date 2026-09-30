# I'm a dump

### Prompt

The keyword is hexadecimal, and removing an useless H.E.H.U.H.E. from the flag. The flag is in the format CTFlearn{*}

https://ctflearn.com/challenge/download/883

### Approach

#### First Solution

- The prompt and challenge title suggest that I have to use 'hexdump' to solve the challenge, but simply running 'strings' on the provided file revealed the flag.  

  [![https://imgur.com/o8glEER.png](https://imgur.com/o8glEER.png)](https://imgur.com/o8glEER.png)

- Obtained the flag by simply cleaning out the string by removing unnecessary line-breaks and Hs.

- Flag obtained : ```CTFlearn{fl4ggyfl4g}```  

  
#### UPDATE : Second Solution

- I then revisited this challenge to do it the "right" way, or rather, the way the author intended it.

- Ran the following command on the provided file to view its hex dump.

  ```
  hexdump -C file
  ```
- Scrolled through the output to find the flag.

  [![https://imgur.com/omotBsk.png](https://imgur.com/omotBsk.png)](https://imgur.com/omotBsk.png)

- Removed "H.E.H.U.H.E." as instructed in the prompt to reveal the flag.

- Flag obtained = ```CTFlearn{fl4ggyfl4g}```

- In my opinion, the first solution seemed easier.
