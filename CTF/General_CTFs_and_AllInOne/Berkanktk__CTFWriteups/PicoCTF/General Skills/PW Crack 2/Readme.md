# PW Crack 2

## Information about the CTF
Can you crack the password to get the flag?

## How to solve it
When the script is run, it asks for a password, which we can see is stored as a character in hex. To get this hex representation as an ASCII, we can just print out the unicode characters before the password prompt, in order to get the correct password. 

So we get from this code:
```python
def level_2_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    if user_pw == chr(0x64) + chr(0x65) + chr(0x37) + chr(0x36):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")
```

To this:
```python
def level_2_pw_check():
    print('Password:', chr(0x64) + chr(0x65) + chr(0x37) + chr(0x36))
    user_pw = input("Please enter correct password for flag: ")
    if user_pw == chr(0x64) + chr(0x65) + chr(0x37) + chr(0x36):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")
```

Which gives us the password, and hence the flag.
