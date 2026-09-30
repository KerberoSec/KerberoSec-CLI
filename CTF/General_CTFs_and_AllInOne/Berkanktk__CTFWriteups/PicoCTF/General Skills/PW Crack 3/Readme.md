# PW Crack 3

## Information about the CTF
Can you crack the password to get the flag?

There are 7 potential passwords with 1 being correct. You can find these by examining the password checker script.

## How to solve it
We know that one out of 7 passwords is correct, so we can just try all of them by modifying the code and iterating through them all.

The passwords is stored in a list called `pos_pw_list`, so the following piece of code should work.
```python
pos_pw_list = ["8799", "d3ab", "1ea2", "acaf", "2295", "a9de", "6f3d"]

for i in pos_pw_list:
    if hash_pw(i) == correct_pw_hash:
        print("Trying password:", i)
        user_pw = i
        user_pw_hash = hash_pw(user_pw)
```

To implement this, the `level_3_pw_check()` function should look like this:
```python
def level_3_pw_check():
    pos_pw_list = ["8799", "d3ab", "1ea2", "acaf", "2295", "a9de", "6f3d"]

    # user_pw = input("Please enter correct password for flag: ")
    # user_pw_hash = hash_pw(user_pw)

    for i in pos_pw_list:
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
