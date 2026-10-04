
#FreeRoom  #hashes  #cryptography 

https://tryhackme.com/r/room/cyberchefbasics

CyberChef is a simple, intuitive web-based application designed to help with various “cyber” operation tasks within your web browser. Think of it as a **Swiss Army knife** for data: like having a toolbox of different tools designed to do a specific task. These tasks range from simple encodings like **XOR** or **Base64** to complex operations like **AES encryption** or **RSA decryption**. CyberChef operates on **recipes**, a series of operations executed in order.

There are different ways to access and run CyberChef. Let's check the two most convenient methods!

### Online Access

All you need is a web browser and an internet connection. Then, you can click this [link](https://gchq.github.io/CyberChef) to open CyberChef directly within your web browser.

### Offline or Local Copy

You can run this offline or locally on your machine by downloading the latest release file from this [link](https://github.com/gchq/CyberChef/releases). This will work on both Windows and Linux platforms. As best practice, you should download the most stable version.

## The Operations Area

This is a practical and comprehensive repository of all the diverse operations that CyberChef is equipped to perform. These operations are meticulously categorized, offering users convenient access to various capabilities. Users can utilize the search feature to locate specific operations quickly, enhancing their efficiency and productivity.

Below are some operations you might use throughout your cyber security journey.

![[Screen Shot 2025-01-17 at 4.20.27 PM.png]]

## The Recipe Area

This is considered as the heart of the tool. In this area, you can seamlessly select, arrange, and fine-tune operations to suit your needs. This is where you take control, defining each operation's arguments and options precisely and purposefully. The recipe area is a designated space to select and arrange specific operations and then define their respective arguments and options to customize their behaviour further. In the recipe area, you can drag the operations you want to use and specify arguments and options.

Features include the following:

- `Save recipe`: This feature allows the user to save selected operations.
- `Load recipe`: Allows the user to load previously saved recipes.
- `Clear Recipe`: This feature will enable users to clear the chosen recipe during usage.

```
In which area can you find "From Base64"?
operations

Which area is considered the heart of the tool?
recipe
```

## process 

1. set clear objective
2. put your data into the input area
3. select the operations you might want to use
4. check the output, repeat steps 

## Practice 

extractors
```
extract IP address
extract email    anything@domain[.]com
extract url

date & time ----
from UNIX time
to UNIX time

data format ------
from base64
url decode
from base85
to base62

THM => ASCII

```

```
What is the hidden email address?

hidden@hotmail.com

What is the hidden IP address that ends in .232?
102.20.11.232

Which domain address starts with the letter "T"?
TryHackMe.com

What is the binary value of the decimal number 78?
from decimal>binary
01001110

What is the URL encoded value of `https://tryhackme.com/r/careers`?

https%3A%2F%2Ftryhackme%2Ecom%2Fr%2Fcareers

```

## cook

```
Using the file you downloaded in Task 5, which IP starts and ends with "10"?

10.10.2.10

What is the base64 encoded value of the string "**Nice Room!**"?
TmljZSBSb29tIQ==

What is the URL decoded value for `https%3A%2F%2Ftryhackme%2Ecom%2Fr%2Froom%2Fcyberchefbasics`?

https://tryhackme.com/r/room/cyberchefbasics

What is the datetime string for the Unix timestamp `1725151258`?

Sun 1 September 2024 00:40:58 UTC

What is the Base85 decoded string of the value `<+oue+DGm>Ap%u7`?
This is fun!
```

