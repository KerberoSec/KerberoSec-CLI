# So Many 64s
## About

### General Information

__Challenge__: Help! My friend stole my flashdrive that had the flag on it. When he gave it back the flag was changed! Can you help me decrypt it?

__Challege Category__: CRYPTO

__Challenge Difficulty__: Hard

__Skills__: Python Scripting, Basic Cipher

Download the flag.txt [here.](https://mega.nz/file/OHhUyIqA#H9WxSdG1O7eVcCm0dffggNB0-dBemSpBAXiZ0OXJnLk)

## Solution

So if we cat the flag.txt and we see a big chunk of text.

![So Many 64s File](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/So%20many%2064s/file.png)

After analyzing it, we can say it is, a base64 cipher, that has been encoded over a no. of times. It surely is an easy problem, if you know how to create a python script, to decode a base64 cipher, over and over until it gives us the flag.
Even if you are a beginner, I will show you how I created this script in brief.

### The Script Logic

First of all, We got to find out how to base64 decode a cipher in python. A little google search gave me [this.](https://docs.python.org/2/library/base64.html)
This is a documentation of a python library named base64. So I imported it into my script.

Now, another thing we got is to do is create a loop, which only terminates when the ```b64decode()``` function throws an error, as there will be a point when the decoding will end by reaching the flag. So, we are going to use the exception handling here

Also, you must know how to perform file operations in python. You can find the resources regarding it [here.](https://www.geeksforgeeks.org/file-handling-python/)

### The Python Script

After implementing these instructions to your code, you will be geting this program.

```python
import base64                                                                
                                                                                            
f = open("flag.txt","r")                                                                    
message = f.read()                                                                          
f.close()
count=0       # (Optional) in case you want to know how many times this was encoded with base64.

try:
     while 1:
           message = b64decode(message)       #As soon as the function throws an error
           count+=1
except:
     print message                  #Message will be printed with a flag
     print count                    #Also the no. of times it was decoded
```

When you run the script, the output will be this:

![So Many 64s flag](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/So%20many%2064s/flag.png)

__Flag__: ABCTF{pr3tty_b4s1c_r1ght?}
