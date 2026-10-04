# First Find
##### Tags: `picoGym Exclusive` `General Skills`
### DESCRIPTION
Unzip this archive and find the file named 'uber-secret.txt'
[Download zip file](https://artifacts.picoctf.net/c/501/files.zip)
###### Mình làm bài này vì đây là một kỹ năng tìm kiếm file cơ bản nhưng đến hôm nay mình mới được sử dụng :).
```bash
$ unzip files.zip
$ find /home/hoang/Downloads/files -type f -name 'uber-secret.txt'

/home/hoang/Downloads/files/adequate_books/more_books/.secret/deeper_secrets/deepest_secrets/uber-secret.txt

$ cat /home/hoang/Downloads/files/adequate_books/more_books/.secret/deeper_secrets/deepest_secrets/uber-secret.txt
picoCTF{f1nd_15_f457_ab443fd1}
```
