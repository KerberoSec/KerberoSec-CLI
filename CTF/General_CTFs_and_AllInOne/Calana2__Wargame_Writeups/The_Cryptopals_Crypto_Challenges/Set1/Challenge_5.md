# Implement repeating-key XOR

![2025-04-08-204512_1020x347_scrot](https://github.com/user-attachments/assets/4e0e21b1-66b8-4061-a3d6-3f554557d87a)

Creamos un programa que encripte el mensaje usando la clave "ICE"

Solucion en Go:
``` go
package main

import (
	"encoding/hex"
	"fmt"
)

func XOR_encrypt(msg []byte, key []byte) ([]byte, error) {
  result := make([]byte,len(msg))
  if len(msg) < len(key) {
    return nil, fmt.Errorf("Key must be less or equal than the message")
  }
  key_index := 0
  for i:=0; i < len(msg); i++ {
    result[i] = msg[i] ^ key[key_index]
    key_index = (key_index+1) % len(key)
  }
  return result,nil
}

func main() {
  message := []byte("Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal")
  key := []byte("ICE")
  result,err := XOR_encrypt(message,key)
  if err != nil {
    fmt.Println("Error: ",err)
    return
  }
  fmt.Println(hex.EncodeToString(result))
}
```

```
go run xor.go
0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f
```

Solucion en python:
``` python
def repeated_xor(msg, key):
    if len(key) > len(msg):
        print("Key must be less or equal than the message")
    result = []
    key_index = 0
    for i in range(0,len(msg)):
        result.append(msg[i] ^ key[key_index])
        key_index = (key_index+1) % len(key)
    return bytes(result)

msg = b"Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal"
key = b"ICE"

result = repeated_xor(msg,key)
print(result.hex())
```

