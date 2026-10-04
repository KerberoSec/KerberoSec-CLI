 ## HMVLabs: Venus

Venus is a beginner challenge to start learning linux and basic scripting. Based on it's challenge page, it's say that *"This is a beginner level so enjoy and be patient!"*.

So, let's start the challenge!!

### Connect to this Machine

Using SSH Connection to connect using this command:
```sh
ssh hacker@venus.hackmyvm.eu -p 5000
```
and input the password. The password was available on it's official website on this [link](https://hackmyvm.eu/venus/index.php).

### 001: Venus

To start hacking, let's read the readme.txt on the machine first :D <br />

![image](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/e91ad7f3-a3f2-431f-97d3-d7fca20dc6c2)

After read the image, we know that we should open the mission.txt to know what mission we should solve. Let's open the file instead :D <br />
![venus-mission](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/25a31508-d312-4e5b-91b6-e925acca4dbb)

Okay, because the mission said that there is a hidden file in this folder. Let's take a look using `ls -lah` command. Then we found a file that named `.myhiddenpazz`. Open it and use to connect with user sophia using `su sophia` and insert the password that we found at previouz `.myhiddenpazz` file.

Go to home directory of user sophia and cat the flagz.txt. <br />

![sophia-flagz](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/8c161d75-a536-40ba-855f-b526fd8b9ff8)

### 002: Sophia

Let's move to the sophia challenge and take a look of it's mission. <br />

![Screenshot 2023-08-01 024836](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/41f65a99-1f4c-4c6c-9644-bceca75a1205)

The mission said that user angela does not remember where she place the `whereismypazz.txt`. So let's find the specific file using this command:
```sh
find / -name "whereismypazz.txt" -print 2>/dev/null
```

The find command will find `whereismypazz.txt` file on `/` path, and will redirect the error message to `/dev/null`. Gotcha! The file was found in `/usr/share/whereismypazz.txt`. Let's open that file and use it to connect with user angela then go to home directory of user angela and cat the flagz.txt. <br />

![Screenshot 2023-08-01 025916](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/a19588ff-d1bb-45d8-8bc5-323bbc104d3f)

### 003: Angela

Yo! We made it here and let's open the next mission! <br />

![Screenshot 2023-08-01 030151](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/869e4c82-07c6-4d92-99f5-4a038df85226)

The mission said that user emma is in line 4069 of file `findme.txt`. It's easy because we can find the specific line using awk
```
awk 'NR==4069' findme.txt
```

Let's try to connect with user emma using that password and gotcha we successfully connected to user emma :D. Then, go to home directory and cat the flag! <br />

![Screenshot 2023-08-01 031447](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/caf03d4e-736d-44ff-8727-fb80dfcf5803)

### 004: Emma

Open the mission and it will say that user mia has left her password in: files. <br />

![Screenshot 2023-08-01 032246](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/e7e6ec90-6714-4c2c-882f-bbbb66071e83)

This is a little bit tricky because it requires some attentions to work with dashed filename in unix/linux because dash (-) is generally used by commands to specify options and arguments.

So let's cat the file using the dot (current directory)
```
cat ./-
```

Then we found mia's password. Let's connect to user mia with that password and cat the flagz.txt. <br />
![Screenshot 2023-08-01 032742](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/b18d283f-e6d1-41cd-9f97-192261f11b45)

### 005: Mia

Open the mission and based on the mission, we should find camila's password in folder `hereiam`. <br />

![Screenshot 2023-08-01 033131](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/925c920a-67a2-4923-8b5c-720cc29ae678)

Let's use the same approach as [sophia's](#002---sophia) approach but we need to add flag `-type d` because we need to find a directory.
```sh
find / -type d -name "hereiam" 2>/dev/null
```

Consequently, the directory can be located at `/opt/hereiam`. Let's list all the file of the directory and cat the `.here` file.

Yey, we found the camila's password! So, let's connect and get the flag :D <br />

![Screenshot 2023-08-01 034215](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/ae0bed68-3fe1-4410-9aab-e4422cd8a2a8)

### 006: Camila

Based on the mission, user luna just left her password inside the muack folder. <br />

![Screenshot 2023-08-01 043913](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/3d3298bc-1208-4dec-a09d-c5878de20e75)

Let's take a look the folder. <br />
![Screenshot 2023-08-01 034959](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/804c10a4-dfd9-4c16-80c6-7f14eaf825dd)

Muack folder have so many directory and subdirectory and searching for them individually would become exceedingly exhausting, so let's just using find command with `type -f` flag that indicate we want to search a file instead of directory.
```
find . -type f
```

Yay, the file was found in `./111/111/muack` and let's just cat the file and use the password to connect to user luna. Then, go cat the flagz.txt :D <br />

![Screenshot 2023-08-01 035415](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/d343a972-7a5f-4910-ba2c-126ce7dc67ba)

### 007: Luna

The mission said that user eleanor has left her password in a file that occupies 6969 bytes. <br />

![Screenshot 2023-08-01 035638](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/bf80bdff-50c9-4416-8808-d503a917a601)

Let's find the 6969 bytes file using `-size` flag
```sh
find / -size 6969c 2>/dev/null
```

That's mean we want to find the file that have 6969 bytes (character) in directory `/`. The file was found in `/usr/share/moon.txt`. Let's cat the text, connect to the user eleanor and get the flag. <br />

![Screenshot 2023-08-01 040205](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/ee2c0700-d299-46d2-849d-d8f922d69d9a)

### 008: Eleanor

Yey you made to this! Let's open the mission and it said that user victoria has left her password in a file in which the owner is the user violin. <br />

![Screenshot 2023-08-01 040511](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/3f4c245d-6343-433a-8c22-c0cba4b9ca84)

So let's find the file by its owner using `-user` flag
```sh
find / -user violin -type f 2>/dev/null
```

Gotcha, the file was found in `/usr/local/games/yo`. Let's go to the directory.

Open the `yo` file and connect to user victoria then get the flaggggg XD <br />

![Screenshot 2023-08-01 041032](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/76522439-32a7-46e1-a454-722511dada17)

### 009: Victoria

We made to #09 mission. Based on the mission, user isla has left her password in a zip file. <br />

![Screenshot 2023-08-01 041218](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/3c02b054-985f-49bb-b73e-abb62b400bd6)

Okay let's try to unzip the zip file. <br />

![Screenshot 2023-08-01 041349](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/c7e4174b-2fbb-4d24-9b41-f50736fe8dce)

It's said that we cannot create a folder because permission is denied. So, because at first mission we can use /tmp folder to write a file, let's just unzip it to `/tmp` folder.
```sh
unzip passw0rd.zip -d /tmp
```

Then, let's just cat the output `/tmp/pwned/victoria/passw0rd.txt` and use the password to connect to user isla and get the flag. <br />

![Screenshot 2023-08-01 042007](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/f7ae701c-bf39-48e4-9e3d-e0bf19f58cb7)

### 010: Isla

The mission said that The password of the user violet is in the line that begins with a9HFX. <br />

![Screenshot 2023-08-01 043913](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/a7b79725-3b29-43c2-aa0c-c86daab63bf3)

Let's just cat the `passy` file and pip it with grep the `a9HFX` strings and use `^` symbols to indicate that we want the `a9HFX` is the beginning of the string.

```
cat passy | grep '^a9HFX' | awk '{print substr($1,6); }'
```

But, because the `a9HFX` string is not the part of the password, so let's just the print the substring started with index 6 using awk.

Gotcha, we found the password to connect to the user violet and get the flag. <br />

![Screenshot 2023-08-01 044947](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/9a9b231f-4005-4e2d-b7f4-b843df8e54ea)

### 011: Violet

Let's move to mission #11, the mission said that the password of the user lucy is in the line that ends with 0JuAZ (these last 5 characters are not part of her password).<br />

![Screenshot 2023-08-01 043913](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/ac2e24b8-4e1d-43eb-b18a-96316f5dac5f)

So, let's just grep the string that have a `0JuAZ` substring. Using the same approach as previous mission, let's remove the last 5 characters using substr method in awk.

```sh
cat end | grep 0JuAZ | awk '{print substr($1, 1, length($1)-5); }'
```

Then, use the password to login with user lucy and cat the flag. <br />

![Screenshot 2023-08-01 044947](https://github.com/elshiraphine/hackmyvm.eu/assets/89353307/4a16b970-cfef-4ee1-96eb-470e647bcd75)
