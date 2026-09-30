# CryptHack
## introdction
* ordsリスト（ASKII）を順番に複合
```
ords = [99, 114, 121, 112, 116, 111, 123, 65, 83, 67, 73,
        73, 95, 112, 114, 49, 110, 116, 52, 98, 108, 51, 125]
print("Here is your flag:")
print("".join(chr(o) for o in ords))
```
* １６進数をバイトに変換してASKIIで表示
```
str = "63727970746f7b596f755f77696c6c5f62655f776f726b696e675f776974685f6865785f737472696e67735f615f6c6f747d"
print(bytes.fromhex(str))
```
* strを１６進数にしてBase64でエンコード
```
str = "72bca9b68fc16ac7beeb8f849dca1d8a783e8acf9679bf9269f7bf"
print(base64.b64encode(bytes.fromhex(str)))
```
* 10進数を文字列にしてベース６４でエンコード
```
from Crypto.Util.number import *
str = 11515195063862318899931685488813747395775516287289682636499965282714637259206269
print(long_to_bytes(str))
```
* ユニコードをXORで濾過する。
```
string = 'label'
integer = 13

unicode_repr = [ord(c) for c in string]
xor_unicode = [13 ^ i for i in unicode_repr]
xor_string = "".join(chr(o) for o in xor_unicode)

flag = "crypto{"+xor_string+"}"
print(flag)
```
* xorの可換の特性を使う。fromhex(k1[i])はできなくてfromhex(k1)じゃないと出来ない。
```
Commutative: A ⊕ B = B ⊕ A
Associative: A ⊕ (B ⊕ C) = (A ⊕ B) ⊕ C
Identity: A ⊕ 0 = A
Self-Inverse: A ⊕ A = 0
```
```
k1 = "a6c8b6733c9b22de7bc0253266a3867df55acde8635e19c73313"
k2_k1 = "37dcb292030faa90d07eec17e3b1c6d8daf94c35d4c9191a5e1e"
k2_k3 = "c1545756687e7573db23aa1c3452a098b71a7fbf0fddddde5fc1"
flag_k1_k3_k2 = "04ee9855208a2cd59091d04767ae47963170d1660df7f56f5faf"

k1_ord = [o for o in bytes.fromhex(k1)]
k2_k3_ord = [o for o in bytes.fromhex(k2_k3)]
flag_k1_k3_k2_ord = [o for o in bytes.fromhex(flag_k1_k3_k2)]

flag = [o123 ^ o23 for (o123, o23) in zip(flag_k1_k3_k2_ord, k2_k3_ord)]
flag = [f ^ o1 for (f, o1) in zip(flag, k1_ord)]

print("Flag:")
print("".join([chr(f) for f in flag]))
```
* xorパズル。暗号文に１から順番にXORをして答えを見つける
```
string = "73626960647f6b206821204f21254f7d694f7624662065622127234f726927756d"
string = [o for o in bytes.fromhex(string)]

for i in range(30):
    flag = [i ^ o for o in string]
    print(i, "".join([chr(f) for f in flag]))
```
* 最初の７文字が"crypto{"になるはずだから７文字だけXORする。すると、"myXORke"と出るのでKeyが"myXORkey"と予想して"y"を付け足し、複合する。
```
encrypted_msg = "0e0b213f26041e480b26217f27342e175d0e070a3c5b103e2526217f27342e175d0e077e263451150104"
encrypted_msg = bytes.fromhex(encrypted_msg)
print(type(encrypted_msg))
print(ord('z'))
flag_format = b"crypto{"
flag = [encrypted_msg[i] ^ flag_format[i] for i in range(7)]
print("".join([chr(f) for f in flag]))
# flag = "myXORke"だからyを足して"myXORkey"とする
flag.append(ord("y"))
s = []
for i in range(len(encrypted_msg)):
    s.append((flag[i % len(flag)]) ^ encrypted_msg[i])
print("".join([chr(f) for f in s]))
```
