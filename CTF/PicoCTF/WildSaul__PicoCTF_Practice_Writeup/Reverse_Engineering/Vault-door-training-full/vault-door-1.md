# VAULT DOOR 1 
###### Tags: `picoCTF-2019` `Reverse Engineering`
### DESCRIPTION
his vault uses some complicated arrays! I hope you can make sense of it, special agent. The source code for this vault is here: [VaultDoor1.java](https://jupiter.challenges.picoctf.org/static/29b91e638ccbd76aaa8c0462d1c64d8d/VaultDoor1.java)
### Hiểu đoạn code:
```java
// I came up with a more secure way to check the password without putting
    // the password itself in the source code. I think this is going to be
    // UNHACKABLE!! I hope Dr. Evil agrees...
    //
    // -Minion #8728
    public boolean checkPassword(String password) {
        return password.length() == 32 &&
               password.charAt(0)  == 'd' &&
               password.charAt(29) == '3' &&
               password.charAt(4)  == 'r' &&
               password.charAt(2)  == '5' &&
               password.charAt(23) == 'r' &&
               password.charAt(3)  == 'c' &&
               password.charAt(17) == '4' &&
               password.charAt(1)  == '3' &&
               password.charAt(7)  == 'b' &&
               password.charAt(10) == '_' &&
               password.charAt(5)  == '4' &&
               password.charAt(9)  == '3' &&
               password.charAt(11) == 't' &&
               password.charAt(15) == 'c' &&
               password.charAt(8)  == 'l' &&
               password.charAt(12) == 'H' &&
               password.charAt(20) == 'c' &&
               password.charAt(14) == '_' &&
               password.charAt(6)  == 'm' &&
               password.charAt(24) == '5' &&
               password.charAt(18) == 'r' &&
               password.charAt(13) == '3' &&
               password.charAt(19) == '4' &&
               password.charAt(21) == 'T' &&
               password.charAt(16) == 'H' &&
               password.charAt(27) == 'f' &&
               password.charAt(30) == 'b' &&
               password.charAt(25) == '_' &&
               password.charAt(22) == '3' &&
               password.charAt(28) == '6' &&
               password.charAt(26) == 'f' &&
               password.charAt(31) == '0';
    }
}
```
##### + Như vậy, đoạn mật khẩu đã được chia nhỏ và ra thành 32 phần nhỏ. như vậy ta chỉ cần viết một đoạn code tổng hợp thông tin trên thành một chuỗi ký tự là xong.
```python
myPass = [None] * 32

myPass[0]  = 'd'
myPass[29] = '3'
myPass[4]  = 'r'
myPass[2]  = '5'
myPass[23] = 'r'
myPass[3]  = 'c'
myPass[17] = '4'
myPass[1]  = '3'
myPass[7]  = 'b'
myPass[10] = '_'
myPass[5]  = '4'
myPass[9]  = '3'
myPass[11] = 't'
myPass[15] = 'c'
myPass[8]  = 'l'
myPass[12] = 'H'
myPass[20] = 'c'
myPass[14] = '_'
myPass[6]  = 'm'
myPass[24] = '5'
myPass[18] = 'r'
myPass[13] = '3'
myPass[19] = '4'
myPass[21] = 'T'
myPass[16] = 'H'
myPass[27] = 'f'
myPass[30] = 'b'
myPass[25] = '_'
myPass[22] = '3'
myPass[28] = '6'
myPass[26] = 'f'
myPass[31] = '0'

print("picoCTF{{{}}}".format(''.join(myPass)))
```
##### + Chạy đoạn code trên bằng python3 và được flag: _picoCTF{d35cr4mbl3_tH3_cH4r4cT3r5_ff63b0}_.
