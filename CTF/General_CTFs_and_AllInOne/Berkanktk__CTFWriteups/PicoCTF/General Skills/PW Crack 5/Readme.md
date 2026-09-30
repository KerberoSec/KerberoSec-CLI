# PW Crack 5

## Information about the CTF
Can you crack the password to get the flag?

## How to solve it
This challenge is similar to [PW Crack 3](../PW%20Crack%203) and [PW Crack 4](../PW%20Crack%204), but with a lot more possible passwords.

This time, the passwords are stored in a file called `dictionary.txt`.

So to begin with, we need to read the file and store the passwords in a list. Which the following code will do for us:

```python
wordlist = []

with open('dictionary.txt', 'r') as f:
    for line in f:
        wordlist.append(line.strip())
```

Next, we need to iterate through the list of passwords and check if any of them match the correct password. This is again done with the same for-loop as previously. Though this time, the list of passwords is called `wordlist` instead of `pos_pw_list`:

```python
def level_5_pw_check():
    # user_pw = input("Please enter correct password for flag: ")
    # user_pw_hash = hash_pw(user_pw)

    for i in wordlist:
        if hash_pw(i) == correct_pw_hash:
            print("Trying password:", i)
            user_pw = i
            user_pw_hash = hash_pw(user_pw)

    if user_pw_hash == correct_pw_hash:
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return

    print("That password is incorrect")
```

The prompt for the password is commented out in order to avoid the script from asking for a password, and instead just focusing on iterating through the list of possible passwords, which then will be evaluated by the `if` statement. When a password matches the correct value, the flag will be printed.
