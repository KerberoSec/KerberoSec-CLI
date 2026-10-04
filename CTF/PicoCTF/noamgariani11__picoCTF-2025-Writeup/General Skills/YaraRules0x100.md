# Description

Dear Threat Intelligence Analyst,
Quick heads up: we stumbled upon a shady executable file on one of our employee's Windows PCs. Good news: the employee didn't take the bait and flagged it to our InfoSec crew.
Seems like this file sneaked past our Intrusion Detection Systems, indicating a fresh threat with no matching signatures in our database.
Can you dive into this file and whip up some YARA rules? We need to make sure we catch this thing if it pops up again.
Thanks a bunch!
The suspicious file can be downloaded here. Unzip the archive with the password picoctf
Once you have created the YARA rule/signature, submit your rule file as follows:
socat -t60: TCP:standard-pizzas.picoctf.net:59919 < sample.txt
(In the above command, modify "sample.txt" to whatever filename you use).
When you submit your rule, it will undergo testing with various test cases. If it successfully passes all the test cases, you'll receive your flag.

# Solution

`wget https://challenge-files.picoctf.net/c_standard_pizzas/e80e3ddbf4dc5272baf9ac221ef91ab82400f3fe67db9ae7b3c718e961640d5a/suspicious.zip`

`sudo apt install socat -y`

`socat -t60 - TCP:standard-pizzas.picoctf.net:60081 < sample.txt`

`sudo apt install upx -y`

`strings suspicious.exe > file.txt`

Here you can see the magic bytes are `4D 5A` which corresponds to a DOS MZ executable. You can also see that it is packed with upx so to see more you can decompress the file.

`upx -d suspicious.exe`

`strings suspicious.exe > upx_decompressed_file.txt`

Now much more can be seen. Some key points that are used in the YaraRule is the string "YaraRules0x100" and "NtQuery".

Here is the YARA rule:
```
rule Rule{
    strings:
        $str1 = {4D 5A} 
        $str2 = "YaraRules0x100"
        $str3 = "UPX"
        $str4 = "NtQuery"
        $str5 = "debugger process" wide ascii
        
    condition:
        ($str1 and $str2 and ($str3 or $str4)) or $str5
}
```

Flag: `picoCTF{yara_rul35_r0ckzzz_216...}`