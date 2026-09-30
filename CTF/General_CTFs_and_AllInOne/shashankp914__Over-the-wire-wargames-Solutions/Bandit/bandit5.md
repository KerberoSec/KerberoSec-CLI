***Login into Bandit5!***
```bash
ssh bandit5@bandit.labs.overthewire.org -p 2220
```
**Password:** lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR
After that, go to inhere directory
```bash
cd inhere
```
You'll encounter many files there, you have to find human readable , size of 1033 and non executable file
so, type the following command:
```bash
find ./ -type f -size 1033c ! -executable
```
after that, you'll get the file name ./maybehere07/.file2
then, type
```bash
cat ./maybehere07/.file2
```
You'll get the password of level 6

**Password:** P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU

Now,

```bash
exit
```