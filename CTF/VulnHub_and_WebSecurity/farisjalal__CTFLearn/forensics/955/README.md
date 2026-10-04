# Minions

### Prompt

Hey! Minions have stolen my flag, encoded it few times in one cipher, and then hidden it somewhere there: https://mega.nz/file/1UBViYgD#kjKISs9pUB4E-1d79166FeX3TiY5VQcHJ_GrcMbaLhg Can you help me? TIP: Decode the flag until you got a sentence.

### Approach

- Running ```binwalk``` on the provided image file revealed that it had a secret embedded RAR file. I ran the following command to extract the hidden embedded RAR file.\
\
  [![https://imgur.com/dHBL6HY.png](https://imgur.com/dHBL6HY.png)](https://imgur.com/dHBL6HY.png)
  ```
  binwalk --dd='.*' Hey_You.png
  ```

- I then renamed ```D3EDB``` to ```temp.rar``` so that it'd be recognised by ```unrar```. Using ```unrar e temp.rar``` to extract the contents of the rar file revealed a secret file titled ```..txt```.\
\
  [![https://imgur.com/clOiCTN.png](https://imgur.com/clOiCTN.png)](https://imgur.com/clOiCTN.png)

- The file contained a link to another hosted file (Taken for a spin, *sigh*) 

- The new file ```Only_Few_Steps.jpg``` turned out to have another rar file embedded in it.\
\
  [![https://imgur.com/xAlpuRA.png](https://imgur.com/xAlpuRA.png)](https://imgur.com/xAlpuRA.png)

- Repeated steps above with the new file, only to find yet **_ANOTHER_** image titled ```YouWon(ALmost).jpg```\
\
  [![https://imgur.com/YHDVKvO.png](https://imgur.com/YHDVKvO.png)](https://imgur.com/YHDVKvO.png)

- Thankfully, this image had no more embedded files in it (**_whew_**). Running ```strings``` on it revealed a large base64 encoded string though (padded with ```=```).

- Trying to decode this using a base64 decoder (https://base64decode.org) only gave me another base64 encoded string (?!).
\
  [![https://imgur.com/DfWKCzf.png](https://imgur.com/DfWKCzf.png)](https://imgur.com/DfWKCzf.png)

- I then recalled the prompt, and decided to keep decoding the result strings, and I finally came upon the flag.

  ```
  VmtaU1IxUXhUbFZSYXpsV1RWUnNRMVpYZEZkYWJFWTJVVmhrVlZGVU1Eaz0=
  |
  v
  VkZSR1QxTlVRazlWTVRsQ1ZXdFdabEY2UVhkVVFUMDk=
  |
  v
  VFRGT1NUQk9VMTlCVWtWZlF6QXdUQT09
  |
  V
  TTFOSTBOU19BUkVfQzAwTA==
  |
  V
  M1NI0NS_ARE_C00L
  ```

- Whew, this challenge was way too long!

- Flag obtained : ```M1NI0NS_ARE_C00L```
