source: [here](https://youtu.be/QTcLUkX1bWI?si=HCiRppvsBXCDsidP)

# Linux Password Aging

## What is Password Aging?

password aging is a security measure that forces users to change their passwords after a certain period, enhancing security by preventing compromised passwords from being used for an extended time  

__Ways to set the Password Aging options:__
- One time using ```chage``` command
- Making default for every new user by making change in ```/etc/login.def``` file

---

```
chage [-m mindays] [-M maxdays] [-d lastdays] [-I inactive] [-E expiredate] [-W warndays] username
```
---

- ```-d``` : Days since Jan 1, 1970 that password was last changed.
- ```-m``` : Number of days required a user is allowed to change password.
- ```-M``` : Max number of days before password expire, user will be warn.
- ```-I``` : Number of days after password expire, account is disable.
- ```-E``` : Days since Jan 1, 1970 that password was last changed.

Exmaple:  

```chage -M 90 -W 10 paul```  
```grep paul /etc/shadow```

---

## For login define files 

```cat /etc/login.def```  

after entering ```vi /etc/login.def``` then can be configure login options for default users  
Admin can define policies and length also via this file.  

```
PASS_MAX_DAYS 90
PASS_MIN_DAYS 10
PASS_MIN_LEN 8
PASS_WARN_AGE 10
```
  
