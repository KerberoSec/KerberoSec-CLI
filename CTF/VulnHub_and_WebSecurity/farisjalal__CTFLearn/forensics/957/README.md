# PDF by fdpumyp

### Prompt

Hi, just as we talked during a break, you have this file here and check if something is wrong with it. That's the only thing we found strange with this suspect, I hope there will be a password for his external drive

Bye\
\
https://ctflearn.com/challenge/download/957

### Approach
- Running ```strings``` on the file revealed another clue\
\
  [![https://imgur.com/aQvAUBm.png](https://imgur.com/aQvAUBm.png)](https://imgur.com/aQvAUBm.png)

- Clearly the discovered alphanumeric strings are base64 encoded (Indicated by ```=``` padding), so I used a base64 decoder(https://www.base64decode.org/) to obtain the following:\
\
  [![https://imgur.com/ml2ImOU.png](https://imgur.com/ml2ImOU.png)](https://imgur.com/ml2ImOU.png)

- The field labelled 'password' seemed to be a distraction. Decoding the string in the 'external' field revealed the actual flag.\
\
  [![https://imgur.com/X580Va4.png](https://imgur.com/X580Va4.png)](https://imgur.com/X580Va4.png)

- Flag obtained : ```CTFlearn{)_1l0w3y0Um00my123}```
