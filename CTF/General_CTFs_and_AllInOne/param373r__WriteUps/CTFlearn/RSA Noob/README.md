# RSA Noob
## About

### General Information

__Challenge__: These numbers were scratched out on a prison wall. Can you help me decode them?

__Challege Category__: CRYPTO

__Challenge Difficulty__: Medium

__Skills__: Python Scripting, RSA Basics

Download the flag.txt [here.](https://mega.nz/#!al8iDSYB!s5olEDK5zZmYdx1LZU8s4CmYqnynvU_aOUvdQojJPJQ)

## Solution

If you know python scripting well, it's no big challenge for anyone, again am gonna walk you through the logic of the script am gonna create. So let's start...

First things first, let's view the values we are given for finding the RSA. and they are:
```
e=1
c=9327565722767258308650643213344542404592011161659991421
n=245841236512478852752909734912575581815967630033049838269083
```
__NOTE__:If you want to know more about the RSA and what I have done here, check out the references section below.

So, as for RSA, we got to find the value of ```p``` & ```q``` variables by factoring n > to find the ```phi``` function > and ultimately finding the value of private key ```d```. Now all this might seem a little bit confusing if you're a beginner and if you need help. You can check my personally written blog on RSA for CTF beginners (to make you understand the concepts of RSA without getting into too much of mathematics) in the reference section. Though, I will still going to keep it brief for you guys. 

### Finding the values of p and q
I personally use this [site](http://factordb.com/), for factoring the values of p and q. The values are:
```
p=416064700201658306196320137931
q=590872612825179551336102196593
```
### Installing and Importing the modules
Now, if you're not a beginner in RSA you can skip this paragraph, coz in this part I am going to install a library that is necessary to solve this question ```PyCrypto``` module. The reason I am explaining this here is because I know many, that while installing this module face an ```error exit status 1``` type things. So solution to that is to install this and conf this package first by pasting it into the your terminal ```sudo apt install autoconf g++ python2.7-dev``` after the conf is complete you can go and install the module using pip command, (if not, you can install pip using ```sudo curl https://bootstrap.pypa.io/get-pip.py -o pip.py && python pip.py```) ```pip install pycrypto```

Once we have installed the module, we can start coding our script, open your preferred text editor, and at the first line import the library with ```from Crypto.Util.number import *```. Then put in all the values we have gotten so far, like this.
```
e=1
c=9327565722767258308650643213344542404592011161659991421
n=245841236512478852752909734912575581815967630033049838269083
p=416064700201658306196320137931
q=590872612825179551336102196593
```
### Finding the Private Key
Before finding the private key, lets find the value of phi function as as ```private key(d) = 1/e mod phi``` where, e and phi are public key parameters. Din't get that? Check my blog in the [references](#References) after the writeup to read more about RSA for CTF challenges.  
The  value of phi will be ```phi = (p-1)*(q-1)```. The good thing about the imported module is, it makes our work of finding the private key very simple by just using one function, and passing the parameters e and phi, respectively. Therefore, ```d=inverse(e,phi)```

### Finding the Message: The Flag
Now we have all we need to find the value of message, ```message = pow(c,d,n)```. In case you're wondering what is the 3rd parameter doing in the ```pow()``` function, it is to find the modulus of the result of ```c``` to the power ```d``` with ```n```.

At last, when you run this script you will get a long integer string like this... 

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/RSA%20Noob/1.png)

Technically, it is your flag, but only when we convert these long ints into there respective readable bytes, so for that we are going to use another function defined inside the ```Crypto.Util``` library i.e. ```long_to_bytes()``` So let's add it to our script and print it with ```print long_to_bytes(message)```

### Running the Script
After adding all these commands to your script, the final script will look somewhat like this...
```python
from Crypto.Util.number import *

e=1
c=9327565722767258308650643213344542404592011161659991421
n=245841236512478852752909734912575581815967630033049838269083
p=416064700201658306196320137931
q=590872612825179551336102196593

phi=(p-1)*(q-1)
d=inverse(e,phi)
message = pow(c,d,n)

print long_to_bytes(message)
```
Run the script with the command: ```python <script>.py```

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/RSA%20Noob/2.png)

__Flag__: abctf{b3tter_up_y0ur_e}
## References

__RSA Overview__: [GeeksforGeeks](https://www.geeksforgeeks.org/rsa-algorithm-cryptography/), [Wikipedia](https://en.wikipedia.org/wiki/RSA_(cryptosystem))  
__Crypto Module__: [PyPi](https://pypi.org/project/pycrypto/), [PyCryptoDome](https://pycryptodome.readthedocs.io/en/latest/src/util/util.html)  
__My Blog__: [theProJax](#)
