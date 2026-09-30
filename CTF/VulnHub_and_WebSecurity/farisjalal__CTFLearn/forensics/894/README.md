# Simple Stenography

### Prompt

Think the flag is somewhere in there. Would you help me find it? hint-" Steghide Might be Helpfull"\
\
https://ctflearn.com/challenge/download/894

### Approach

- The prompt hinted to use ```steghide```, so I tried extracting an embedded file using the following command, but I was asked for a passphrase.\
  ```
  steghide -sf Minions1.jpeg
  ```
  [![https://imgur.com/QObMSo4.png](https://imgur.com/QObMSo4.png)](https://imgur.com/QObMSo4.png)

- I tried looking in the file's metadata using ```exiftool```, nothing seemed very obvious, but then I noticed a keyword field with the string 'myadmin'\
\
  [![https://imgur.com/lpOSCi2.png](https://imgur.com/lpOSCi2.png)](https://imgur.com/lpOSCi2.png)

- I tried using it as the passphrase to use ```steghide```, and it worked!

- The contents of the extracted file revealed an alphanumeric string that seemed like a base64 encoded string.\
\
  [![https://imgur.com/HIDMVU2.png](https://imgur.com/HIDMVU2.png)](https://imgur.com/HIDMVU2.png)

- Finally, I used a base64 decoder(https://www.base64decode.org/) to obtain the flag.\
\
  [![https://imgur.com/ElafRPx.png](https://imgur.com/ElafRPx.png)](https://imgur.com/ElafRPx.png)

- Flag obtained : ```CTFlearn{this_is_fun}```
