# Fixed XOR

![2025-03-31-185400_1027x334_scrot](https://github.com/user-attachments/assets/0dc15c67-4cf8-45e4-b9c8-2e0eeb32418f)

XOR es una operacion bit a bit definida por la siguiente tabla de verdad:

![cpp-bitwise-xor-operator](https://github.com/user-attachments/assets/c8912f75-a88d-4a28-b8fd-63044149126a)

Convertimos el texto en hexadecimal a bytes y realizamos la operacion XOR byte a byte porque el hardware trabaja con valores de 32 a 64 bits debido al tamaño de los registros

---

Solucion en Go:
``` go
package main

import (
	"encoding/hex"
	"fmt"
)

func FixedXOR(s1 string, s2 string) string {
 raw1,_ := hex.DecodeString(s1)
 raw2,_ := hex.DecodeString(s2)
 if (len(raw1) != len(raw2)) {
  return ""
 }
 raw3 := make([]byte,len(raw1))
 for i:=0; i < len(raw1); i++ {
   raw3[i] = raw1[i] ^ raw2[i]
 }
 return hex.EncodeToString(raw3)
}

func main(){
  s1 := "1c0111001f010100061a024b53535009181c"
  s2 := "686974207468652062756c6c277320657965"
  s3 := FixedXOR(s1,s2)
  fmt.Println(s3)
}
```

Solucion en Python:
``` python
def FixedXOR(s1: str , s2: str) -> str:
    raw_s1 = bytes.fromhex(s1)
    raw_s2 = bytes.fromhex(s2)
    assert(len(raw_s1) == len(raw_s2))
    s3 = bytes(raw_s1[i] ^ raw_s2[i] for i in range(len(raw_s1)))
    return s3.hex()

print(FixedXOR("1c0111001f010100061a024b53535009181c","686974207468652062756c6c277320657965"))
```
