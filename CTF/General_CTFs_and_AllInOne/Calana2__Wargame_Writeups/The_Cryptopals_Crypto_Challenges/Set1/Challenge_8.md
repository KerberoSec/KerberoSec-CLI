# Detect AES in ECB mode

![2025-04-23-195327_985x244_scrot](https://github.com/user-attachments/assets/a39b9b37-f00b-4b82-8c1c-c5968ad94405)

El archivo que nos dan son varias lineas en hexadecimal, debemos tomar cada una y verificar si esta encriptada con AES-ECB. Para eso usaremos un map o diccionario, donde almacenaremos cada bloque a medida que avancemos en la linea y vemos si esta en el diccionario ya, de ser asi es porque se usa ECB.

Usaremos bloques de 16 bytes

Solucion en Go:
``` go
package main

import (
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

func detectAESInECBMode(data []byte, keySize int) bool {
  blocks := make(map[string]bool)
  for i:=0; i<len(data); i+=16 {
   block := string(data[i:i+keySize])
   if blocks[block] {
     return true
   }
   blocks[block] = true
  }
  return false
}

func detectECBFile(lines []string) (int,[]byte,error) {
  for num, line := range lines {
		decoded, err := hex.DecodeString(line)
		if err != nil {
			return 0,nil,err
		}
		if detectAESInECBMode(decoded, 16) {
			return num+1,decoded, nil
		}
  }
  return 0,nil,fmt.Errorf("No AES-ECB ciphertext found")
}

func main() {
  file,err := os.ReadFile("8.txt")
  lines := strings.Split(string(file),"\n")
  if err != nil {
   fmt.Println(err)
   return
  }
  lineNum, data, err := detectECBFile(lines)
  if err != nil {
    fmt.Println(err)
  }
  fmt.Println("Block whit AES-ECB found:")
  fmt.Printf("%d:   %s\n",lineNum,hex.EncodeToString(data))
}
```

Solucion en Python:
``` python
def detectAESInECBMode(data: bytes, keysize: int) -> bool:
    blocks = set()
    for i in range(0,len(data),16):
        block = data[i:i+keysize]
        if block in blocks:
            return True
        blocks.add(block)
    return False

def detectECBFile(lines: list[str]):
    for i,line in enumerate(lines):
        data = bytes.fromhex(line)
        if detectAESInECBMode(data,16):
            return i+1,line
    return 0,""

try:
    with open('8.txt') as file:
        lines = file.readlines()
        linenum, line = detectECBFile(lines)
        if line != "":
         print("Block whit AES-ECB found:")
         print(f"{linenum}: {line}") 

except Exception as e:
    print(f"Error {e}")
```

```
Block whit AES-ECB found:
133:   d880619740a8a19b7840a8a31c810a3d08649af70dc06f4fd5d2d69c744cd283e2dd052f6b641dbf9d11b0348542bb5708649af70dc06f4fd5d2d69c744cd2839475c9dfdbc1d46597949d9c7e82bf5a08649af70dc06f4fd5d2d69c744cd28397a93eab8d6aecd566489154789a6b0308649af70dc06f4fd5d2d69c744cd283d403180c98c8f6db1f2a3f9c4040deb0ab51b29933f2c123c58386b06fba186a
```
