# Implementing PKCS#7 padding

![2025-06-15-191411_1007x367_scrot](https://github.com/user-attachments/assets/97eae380-8689-4a94-bacb-4a68b86d59a5)

Es bastante sencillo. Consiste en que al ultimo bloque del mensaje a cifrar se le añade un padding de N bytes, donde cada byte vale igualmente N.

Para evitar ambiguedades si el ultimo bloque es multiplo del tamaño de bloque se añade un bloque entero de padding.

Solucion en Go:
``` go
package main

import (
	"bytes"
	"fmt"
)

// Lo se, es muy verboso

func pad(chunk []byte, block_size int) ([]byte,error) {
  if len(chunk) > block_size {
    return nil,fmt.Errorf("Longitud del bloque  mayor que lo esperado.")
  }
  plen := block_size - (len(chunk) % block_size)
  pad := bytes.Repeat([]byte{byte(plen)}, plen)
  return append(chunk, pad...),nil
}

func unpad(pchunk []byte) ([]byte, error) {
  plen := int(pchunk[len(pchunk)-1])
  pad := bytes.Repeat([]byte{byte(plen)}, plen)
  if !bytes.Equal(pchunk[len(pchunk)-plen:],pad) {
    return nil,fmt.Errorf("Padding invalido.")
  }
  return pchunk[:len(pchunk)-plen],nil
}

func main() {
  padded,_ := pad([]byte("YELLOW SUBMARINE"),20)
  unpadded,_ := unpad(padded)
  fmt.Println(padded)
  fmt.Println(unpadded)
}
```

Solucion en Python:
``` python
def pkcs7_pad(chunk: bytes, block_size: int):
    if len(chunk) > block_size:
        raise ValueError("Chunk demasiado grande.")
    plen = block_size - (len(chunk) % block_size)
    pad = bytes([plen] * plen)
    return chunk + pad

def pkcs7_unpad(pchunk: bytes):
    plen = pchunk[-1]
    if pchunk[-plen:] != bytes([plen] * plen):
        raise ValueError("Padding invalido.")
    return pchunk[:-plen]

padded = pkcs7_pad(b"YELLOW SUBMARINE",20)
unpadded = pkcs7_unpad(padded)

print(padded)
print(unpadded)
```

