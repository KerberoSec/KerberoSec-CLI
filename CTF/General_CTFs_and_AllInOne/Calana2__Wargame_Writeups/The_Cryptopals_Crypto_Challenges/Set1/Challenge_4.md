# Detect single character XOR

![2025-04-08-175708_741x245_scrot](https://github.com/user-attachments/assets/b1acdb20-0bab-4cd2-9f93-46770f21ce84)

Hacemos del codigo anterior una funcion probamos contra cada linea del archivo

Solucion en Go:
``` go
package main

import (
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

func isASCIIPrintable(b []byte) bool{
 for _,val := range b {
   // Tuve que agregar los caracteres de tabulacion(9) y nueva linea(10)
   // porque de no hacerlo eliminaba lineas validas
   if (val < 32 && val != 9 && val != 10) || val > 126  {
     return false
   }
 }
 return true
}

 func XORBruteForceLine(line string, linenum int) {
  raw_str,_ := hex.DecodeString(line)
  var output []string
  for k := 0; k <= 255; k++ {
    guessed := make([]byte,len(raw_str))
    // Realizar XOR con el texto cifrado y la clave actual
    for i := 0; i < len(raw_str); i++ {
    guessed[i] = raw_str[i] ^ byte(k)
   }
   // Mostrar texto que solo contenga ASCII imprimible
   if isASCIIPrintable(guessed) {
     output = append(output, fmt.Sprintf("key='%c': text=%s\n",rune(k) ,string(guessed)))
   }
  }
  if len(output) == 0 {
   return

  }
  fmt.Printf("\n======== LINE %d ========\n",linenum)
  for _,l := range(output) {
   fmt.Println(l)
  }
 }

func main() {
 f,err := os.ReadFile("4.txt")
 if err != nil {
   fmt.Printf("Error reading the file: %s\n",err)
 }
 for n,l := range(strings.Split(string(f),"\n")) {
   XORBruteForceLine(l,n)
 }
}
```

```
go run xor.go > output.txt
```

Revisamos el archivo y encontramos que la linea 170 fue encriptada con el caracter '5':
```

======== LINE 35 ========
key='s': text=kwb%gpl,$lXgO.OhV	8DF|k7)M{GoN

======== LINE 170 ========
key='': text=gF^	]AH]	]AL	YH[]P	@Z	C\DY@GN#

key='': text=dE]
^BK^
^BO
ZKX^S
CY
@_GZCDM 

key='5': text=Now that the party is jumping         <---

key='6': text=Mlt#wkbw#wkf#sbqwz#jp#ivnsjmd	

key='q': text=
+3d0,%0d0,!d4%60=d-7d.1)4-*#N

key='r': text=	(0g3/&3g3/"g7&53>g.4g-2*7.) M
```

Solucion en python:
``` python
def XORBruteForceLine(line, linenum):
    raw = bytes.fromhex(line)
    output = []
    for k in range(256):
        buffer = bytearray()
        for byte in raw:
            buffer.append(byte ^ k)
        is_printable = all(32 <= b <= 126 or b in {9,10} for b in buffer)
        if is_printable:
            output.append(f"Key={chr(k)} --- Text={buffer.decode('ascii')}")
    if len(output) == 0:
        return
    print(f"\n======== LINE {linenum} ========\n")
    for l in output:
        print(l)
try:
    with open("4.txt", "r") as f:
        for n,l in enumerate(f.readlines()):
            XORBruteForceLine(l,n)
except FileNotFoundError:
    print("Error: File not found.")
```
