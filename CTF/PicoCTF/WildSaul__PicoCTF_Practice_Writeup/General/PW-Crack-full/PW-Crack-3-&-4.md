# PW CRACK 3 & 4
##### Tags: `Beginner picoMini 2022` `General Skills` `password_cracking` `hashing`
### DESCRIPTION:
Can you crack the password to get the flag? Download the password checker [here](https://artifacts.picoctf.net/c/18/level3.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/18/level3.flag.txt.enc) and the [hash](https://artifacts.picoctf.net/c/18/level3.hash.bin) in the same directory too. 
#### (PwCrack3) There are 7 potential passwords with 1 being correct. You can find these by examining the password checker script.
#### (PwCrack4) There are 100 potential passwords with only 1 being correct. You can find these by examining the password checker script.
### Hiểu đoạn code:
##### + Về cơ bản 3 và 4 như nhau, chỉ là dãy mật khẩu trong 3 ngắn hơn nên ta có thể làm thủ công và 4 nhiều mật khẩu hơn nên ta sẽ phải dùng script:
```python
def level_3_pw_check():
    user_pw = input("Please enter correct password for flag: ")
    user_pw_hash = hash_pw(user_pw)
    
    if( user_pw_hash == correct_pw_hash ):
        print("Welcome back... your flag, user:")
        decryption = str_xor(flag_enc.decode(), user_pw)
        print(decryption)
        return
    print("That password is incorrect")

#Danh sách pass của level 3:
pos_pw_list = ["8799", "d3ab", "1ea2", "acaf", "2295", "a9de", "6f3d"]
#Danh sách pass của level 4:
pos_pw_list = ["158f", "1655", "d21e", "4966", "ed69", "1010", "dded", "844c", "40ab", "a948", "156c", "ab7f", "4a5f", "e38c", "ba12", "f7fd", "d780", "4f4d", "5ba1", "96c5", "55b9", "8a67", "d32b", "aa7a", "514b", "e4e1", "1230", "cd19", "d6dd", "b01f", "fd2f", "7587", "86c2", "d7b8", "55a2", "b77c", "7ffe", "4420", "e0ee", "d8fb", "d748", "b0fe", "2a37", "a638", "52db", "51b7", "5526", "40ed", "5356", "6ad4", "2ddd", "177d", "84ae", "cf88", "97a3", "17ad", "7124", "eff2", "e373", "c974", "7689", "b8b2", "e899", "d042", "47d9", "cca9", "ab2a", "de77", "4654", "9ecb", "ab6e", "bb8e", "b76b", "d661", "63f8", "7095", "567e", "b837", "2b80", "ad4f", "c514", "ffa4", "fc37", "7254", "b48b", "d38b", "a02b", "ec6c", "eacc", "8b70", "b03e", "1b36", "81ff", "77e4", "dbe6", "59d9", "fd6a", "5653", "8b95", "d0e5"]

```
##### + Nhưng vì đằng nào cũng phải viết script, ta viết chung cho cả 2 phần và comment dòng của phần kia đi:
```python
import subprocess
from subprocess import Popen as p

pos_pw_list = ["8799", "d3ab", "1ea2", "acaf", "2295", "a9de", "6f3d"]
#pos_pw_list = ["158f", "1655", "d21e", "4966", "ed69", "1010", "dded", "844c", "40ab", "a948", "156c", "ab7f", "4a5f", "e38c", "ba12", "f7fd", "d780", "4f4d", "5ba1", "96c5", "55b9", "8a67", "d32b", "aa7a", "514b", "e4e1", "1230", "cd19", "d6dd", "b01f", "fd2f", "7587", "86c2", "d7b8", "55a2", "b77c", "7ffe", "4420", "e0ee", "d8fb", "d748", "b0fe", "2a37", "a638", "52db", "51b7", "5526", "40ed", "5356", "6ad4", "2ddd", "177d", "84ae", "cf88", "97a3", "17ad", "7124", "eff2", "e373", "c974", "7689", "b8b2", "e899", "d042", "47d9", "cca9", "ab2a", "de77", "4654", "9ecb", "ab6e", "bb8e", "b76b", "d661", "63f8", "7095", "567e", "b837", "2b80", "ad4f", "c514", "ffa4", "fc37", "7254", "b48b", "d38b", "a02b", "ec6c", "eacc", "8b70", "b03e", "1b36", "81ff", "77e4", "dbe6", "59d9", "fd6a", "5653", "8b95", "d0e5"]

for i in range(len(pos_pw_list)):
    echo_str = p(["echo", pos_pw_list[i] + '\n'], stdout=subprocess.PIPE, text=True)
    return_str = p(["python", "level3.py"], stdin=echo_str.stdout, stdout=subprocess.PIPE, text=True)
    #return_str = p(["python", "level4.py"], stdin=echo_str.stdout, stdout=subprocess.PIPE, text=True)
    output, error = return_str.communicate()
    if "That password is incorrect" not in output:
        print(pos_pw_list[i])

```
##### + Lưu ý: `chmod +x` cả hai chương trình.
##### + pass cho level 3: `2295`
##### + flag của PW CRACK 3: `picoCTF{m45h_fl1ng1ng_6f98a49f}`
##### + pass cho level 4: `8b95`
##### + flag của PW CRACK 4: `picoCTF{fl45h_5pr1ng1ng_cf341ff1}`
