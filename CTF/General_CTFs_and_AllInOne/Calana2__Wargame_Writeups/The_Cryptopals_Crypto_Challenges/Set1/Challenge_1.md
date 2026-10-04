# Convert hex to base 64

![2025-03-31-184222_1010x378_scrot](https://github.com/user-attachments/assets/790c9e52-0456-42a1-ace1-5fe7ffe851b7)

Debemos decodificar la cadena en hexadecimal y luego convertirla a base64

### Hexadecimal
Convertir una cadena en hexadecimal a un arreglo de bytes se hace internamente dividiendo el string en parejas de caracteres, convirtiendo estas parejas a un valor entero y almacenarlas en bytes individuales.

### Base64
Base64 es un sistema de numeracion posicional que usa 64 como base. A grandes rasgos sigue estos pasos en la codificacion:
- Divide el texto en bloques de 3 bytes (si faltan bits en el ultimo bloque se rellenan con ceros)
- Separa los 3 bytes en 3*8=24 bits, agrupa estos bits en grupos de 6, o sea obteniendo 24/6=4 agrupaciones
- Calcula el valor entero de cada grupo de 6 bits, lo cual es un indice, que se reemplaza por un caracter en un arreglo de 64 elementos que contiene caracteres en el rango [A-Za-z0-9+/], teniendo 'A' indice 0, y '/' indice 64. Si el grupo de 6 fue puramente relleno, se reemplaza con el caracter especial "=")

Recomiendo buscar mas acerca informacion del tema [aqui](https://datatracker.ietf.org/doc/html/rfc4648)

---
Solucion en Go:
``` go
package main

import (
	"encoding/base64"
	"encoding/hex"
	"fmt"
)

func main() {
  hexstr := "49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d"
  raw,_ := hex.DecodeString(hexstr)
  base64Text := base64.StdEncoding.EncodeToString(raw)
  fmt.Println(base64Text)
}
```

Solucion en Python:
``` python
import base64
hex = "49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d"
raw = bytes.fromhex(hex)
base64Text = base64.b64encode(raw).decode()
print(base64Text)
```
