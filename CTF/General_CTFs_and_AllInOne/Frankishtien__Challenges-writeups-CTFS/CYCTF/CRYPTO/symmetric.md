## symmetric (not solved)

```python
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto.Util.Padding import pad,unpad
import os

key = os.urandom(16)
iv = os.urandom(16)
FLAG=b'CyCTF{dummy_flag}'
def encrypt(pt):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(pt, 16))
    
    return ct.hex()

def decrypt(ct):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = unpad(cipher.decrypt(ct),16)
    return ct

options='''1.encrypt
2.decrypt'''
FLAGG=pad(FLAG,16)
enc=encrypt(FLAG)
fb=[]
for i in range(0,len(FLAGG),16):
	fb.append(FLAG[i:i+16])
print(f'{enc = }')

while True:
		print(options)
	
		option=int(input('> '))
		if option==1:
			pt=input('msg > ').encode()
			ct=encrypt(pt)
			print(f'{ct = }')
		if  option==2:
			ct=input('enter ciphertext in hex> ')
			if len(ct)>64:
				print("can't handle")
				exit()
			try:
				pt=decrypt(bytes.fromhex(ct))
			
				for b in fb:
					if b in pt :
						print('cheating')
						exit()
				print(f'{pt = }')
			except:
				print('something wrong')

```

