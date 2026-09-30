# Implement CBC Mode

![2025-07-05-095541_1023x441_scrot](https://github.com/user-attachments/assets/16bcd87f-60cb-4a28-b065-cea6ba182cbc)

![2025-07-05-111741_824x156_scrot](https://github.com/user-attachments/assets/1a1b6d91-2aaf-4fd3-95d9-6d2a8cc75645)

![Cbc_encryption](https://github.com/user-attachments/assets/398a82c2-f64c-44eb-a2c0-e46efa3de29e)

![Cbc_decryption](https://github.com/user-attachments/assets/a568e466-8f82-4f2d-b7d5-fc5b609ba411)

![2025-07-05-111800_814x248_scrot](https://github.com/user-attachments/assets/afeeee14-9358-4897-86aa-43c25ed341f9)

Sabemos que la clave es "YELLOW SUBMARINE" y el IV es "0000000000000000":

## Solucion en Go
``` go
package main

import (
	"bytes"
	"crypto/aes"
	"encoding/base64"
	"fmt"
	"os"
)

func XOR(var1 []byte, var2 []byte) ([]byte, error) {
  var result []byte
  if len(var1) != len(var2) {
    return nil, fmt.Errorf("Params must have the same length")
  }
  for i:=0; i < len(var1); i++ {
    result[i] = var1[i] ^ var2[i]
  }
  return result,nil
}

func AES_ECB_Decrypt(key, data []byte) ([]byte, error) {
 ciph, err := aes.NewCipher(key)
 if err != nil {
   return nil,err
 }
 blockSize := ciph.BlockSize()
 plaintext := make([]byte,len(data))
 for i,j := 0,blockSize; i < len(data); i,j = i+blockSize,j+blockSize {
   ciph.Decrypt(plaintext[i:j],data[i:j])
 }
 return plaintext,nil
}

func AES_CBC_Decrypt(key, iv, data []byte) ([]byte, error) {
 blockSize := 16
 plaintext := make([]byte,len(data))
 previousBlock := iv
 for i,j := 0,blockSize; i < len(data); i,j = i+blockSize,j+blockSize {
   current_block := data[i:j]
   decrypt,err := AES_ECB_Decrypt(key,current_block)
   if err != nil {
     return nil,err
   }
   plaintext_block,err := XOR(decrypt,previousBlock)
   plaintext = append(plaintext, plaintext_block...)
   previousBlock = current_block
 }
 return plaintext,nil
}

func main() {
  b64_data,err := os.ReadFile("10.txt")
  if err != nil {
    fmt.Println(err)
    return
  }
  raw_data := make([]byte,len(b64_data))
  l,err := base64.RawStdEncoding.Decode(raw_data,b64_data)
  if err != nil {
    fmt.Println(err)
    return
  }
  key := []byte("YELLOW SUBMARINE")
  iv := bytes.Repeat([]byte{byte(0x30)},16)
  plaintext, err := AES_CBC_Decrypt(key,iv,raw_data[:l])
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(plaintext))
}
```

## Solucion en Python
``` python
from Crypto.Cipher import AES
import base64

"""
def AES_CBC_Decrypt(key, iv, data):
    cipher = AES.new(key, AES.MODE_CBC)
    cipher.IV = iv
    plaintext = cipher.decrypt(data)
    return plaintext
"""

def fixed_xor(var1, var2):
    if len(var1) != len(var2):
        print("Params must be the same length")
        return bytes(0)
    result = []
    for i in range(0, len(var1)):
        result.append(var1[i] ^ var2[i])
    return bytes(result)

def AES_ECB_Decrypt(key, data):
    cipher = AES.new(key, AES.MODE_ECB)
    plaintext = cipher.decrypt(data)
    return plaintext

def AES_CBC_Decrypt(key,iv,raw_data):
    # manual approach
    plaintext = b""
    previous_block = iv
    block_size = AES.block_size
    for i in range(0,len(raw_data),block_size):
        current_block = raw_data[i:i+block_size]
        decrypted = AES_ECB_Decrypt(key,current_block)
        plaintext_block = fixed_xor(decrypted,previous_block)
        plaintext += plaintext_block
        previous_block = current_block
    return plaintext

try:
    with open('10.txt') as file:
        data = file.read()
        raw_data = base64.b64decode(data)
        key = b"YELLOW SUBMARINE"
        iv = b"0" * 16
        plaintext = AES_CBC_Decrypt(key,iv,raw_data)
        print(plaintext.decode(errors="ignore"))
except FileNotFoundError:
    print("File not found")
```

