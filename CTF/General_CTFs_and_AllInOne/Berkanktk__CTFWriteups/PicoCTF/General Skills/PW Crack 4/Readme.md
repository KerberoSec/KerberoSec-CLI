# PW Crack 4

## Information about the CTF
Can you crack the password to get the flag?

There are 100 potential passwords with only 1 being correct. You can find these by examining the password checker script.

## How to solve it
This challenge is similar to [PW Crack 3](../PW%20Crack%203), but with 100 possible passwords instead of 7. The passwords are again stored in a list called `pos_pw_list`, so the same piece of code consisting of a for-loop should work. Keep in mind that the `pos_pw_list` variable should be placed above the function in order to be accessible from within the function.

```python
def level_4_pw_check():
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
