# Single-byte XOR cipher

![2025-03-31-194218_1056x392_scrot](https://github.com/user-attachments/assets/5f73e670-73a6-4cc9-a473-586f2715a157)

Esta vez el texto ha sido XOReado con una clave desconocida de un byte

Un byte contiene un valor en el rango [0,255] por lo que la clave es facilmente recuperable encontrando todas las combinaciones posibles, usando fuerza bruta

---

Solucion en Go:
``` go
package main

import (
	"encoding/hex"
	"fmt"
)

func isASCIIPrintable(b []byte) bool{
 for _,val := range b {
   if val < 32 || val > 126 {
     return false
   }
 }
 return true
}

func main() {
  raw_str,_ := hex.DecodeString("1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736")
  for k := 0; k <= 255; k++ {
    guessed := make([]byte,len(raw_str))
    // Realizar XOR con el texto cifrado y la clave actual
    for i := 0; i < len(raw_str); i++ {
    guessed[i] = raw_str[i] ^ byte(k)
   }
   // Mostrar texto que solo contenga ASCII imprimible
   if isASCIIPrintable(guessed) {
     fmt.Printf("key='%c': text=%s\n",rune(k) ,string(guessed))
   }
  }
}
```

```
go run set1_3.go
key='G': text=\pptvqx?R\8l?svtz?~?opjq{?py?}~|pq
key='J': text=Q}}y{|u2_Q5a2~{yw2s2b}g|v2}t2psq}|
key='M': text=Vzz~|{r5XV2f5y|~p5t5ez`{q5zs5wtvz{
key='O': text=Txx|~yp7ZT0d7{~|r7v7gxbys7xq7uvtxy
key='P': text=Kggcafo(EK/{(dacm(i(xg}fl(gn(jikgf
key='Q': text=Jffb`gn)DJ.z)e`bl)h)yf|gm)fo)khjfg
key='S': text=Hdd`bel+FH,x+gb`n+j+{d~eo+dm+ijhde
key='U': text=Nbbfdcj-@N*~-adfh-l-}bxci-bk-olnbc
key='V': text=Maaeg`i.CM)}.bgek.o.~a{`j.ah.loma`
key='X': text=Cooking MC's like a pound of bacon      <---- La tenemos!
key='Y': text=Bnnjhof!LB&r!mhjd!`!qntoe!ng!c`bno
key='Z': text=Ammikle"OA%q"nkig"c"rmwlf"md"`caml
key='[': text=@llhjmd#N@$p#ojhf#b#slvmg#le#ab`lm
key='\': text=Gkkomjc$IG#w$hmoa$e$tkqj`$kb$fegkj
key=']': text=Fjjnlkb%HF"v%iln`%d%ujpka%jc%gdfjk
key='^': text=Eiimoha&KE!u&jomc&g&vishb&i`&dgeih
key='_': text=Dhhlni`'JD t'knlb'f'whric'ha'efdhi
```

Solucion en Python:
``` python
raw = bytes.fromhex("1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736")

for k in range(256):
    buffer = bytearray()
    for byte in raw:
        buffer.append(byte ^ k)
    is_printable = all(32 <= b <= 126 for b in buffer)
    if is_printable:
        print(f"Key={chr(k)}: {buffer.decode('ascii')}")
```

