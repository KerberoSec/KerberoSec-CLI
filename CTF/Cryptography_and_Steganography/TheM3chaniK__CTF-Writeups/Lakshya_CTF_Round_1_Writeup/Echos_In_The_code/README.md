# 🚀 Echos In The Code
**Category** Web Security  
**Difficulty** Medium  
**Points:** 150

## Description
A web application exposes certain files to users, but someone was able to retrieve sensitive information that wasn’t meant to be public.

Figure out how they did it and extract the flag.

URL: https://lakshyactf-web2.onrender.com

Flag Format: LakshyaCTF{...}

## Tools Used
 * python3
 
## Resources
 * Custom python Script
 * [GeckoDriver](https://github.com/mozilla/geckodriver)
 * [python requirements.tx](./requirements.txt)

## 🧠 Analysis

- Step 1: Trying Different Types of Input Field attack   
  As soon as we saw the input field we tried different types of input field attacks like **sql injection**, **Command Injection**, **SSTI** but nothing work

- Step 2: Inspecting webpage source code  
  Then though of inspecting the webpage source code strict on our head maybe there would be a hint. And fun fact there was
    ```html
    <!-- hmm maybe there is a public.txt here -->
    ```

- Step 3: Downloading public.txt
  After getting the hint we enter `public.txt` in the enter field but it didn't download any file instead redirect to another webpage. There was a text written:
  ```html
    Welcome to our website!  
    Enjoy your stay and download the files you need. 
  ```

  At first glance it seemed useless but when we scrolled down a lot we found another text

  ```html
    Sometimes, all it takes is knowing where to look for some "secret". Maybe in /files?
  ```

  hmmmm. Seems like another hint, Maybe there is a dir `files/` and a maybe a file named secret or maybe a secret in one of the files of that dir, maybe our flag.

- Step 4: Making wordlist  
  With the previous hint we construct a huge possible files wordlist using ChatGPT where our flag could be. You can see the wordlist [here](./wordlist.txt)

- Step 5: Making Custom python script  
  Manually testing all the dirs could be a nightmare so we wrote a python script which can you see here. The script use `selenium` web driver to detect the input field of the website and take words from our wordlist paste it and submit.

- Step 6: Getting the flag  
  We ran the python script:
  ```bash
    python3 script.py
  ```
  But our python script had a bug, it is made in a way that if there is a downloadable file it download into a folder. But the flag was not in a file. If we put `../files/secret.txt` it redirect us to a different page where the flag is written in a plain text.
  But hopefully one of the teammate is monitoring the code and he saw it on time and Hurrah!! We get the flag.

## 🏁 Flag

```bash
LakshyaCTF{yOu_sOlVeD_FiLe_TrAvErSaL}
```