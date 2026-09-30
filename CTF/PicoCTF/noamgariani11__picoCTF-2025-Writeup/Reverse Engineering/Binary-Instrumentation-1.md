# Description

I have been learning to use the Windows API to do cool stuff! Can you wake up my program to get the flag?
Download the exe here. Unzip the archive with the password picoctf

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/c71239e2890bd0008ff9c1da986438d276e7a96ba123cb3bc7b04d5a3de27fe7/bininst1.zip`

Then `unzip binist1.zip` with the password `picoctf`. I first tried strings and then using `binwalk -e bininst1.exe` and then `cd _bininst1.exe.extracted/` you can see more strings. You can run `strings 6000` and look through them or `strings 6000 | grep flag` to see the base64 encoded flag:

`Ok, I'm Up! The flag is: cGljb0NURnt3NGtlX20zX3VwX3cxdGhfZnIxZGFfZjI3YWNjMzh9`

From here you can use [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)) or `echo "cGljb0NURnt3NGtlX20zX3VwX3cxdGhfZnIxZGFfZjI3YWNjMzh9" | base64 -d` to decode the base64 to get the flag.

Keep in mind that this is an unintended solution.

Flag: `picoCTF{w4ke_m3_up_w1th_fr1da_f27a...}`