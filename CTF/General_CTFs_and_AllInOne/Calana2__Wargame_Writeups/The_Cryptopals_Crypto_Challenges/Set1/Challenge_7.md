# AES in ECB mode

![2025-04-23-183419_1002x398_scrot](https://github.com/user-attachments/assets/442ef937-7f8f-4a4d-811d-41b2613edaf8)

Tenemos que implementar AES-ECB para desencriptar el texto que nos dan con la clave "YELLOW SUBMARINE"

### Teoria

Advanced Encryption Standard (`AES`) es un esquema de cifrado en bloques que se estableció como estandar en el 2002. AES tiene un tamaño de bloque fijo de 128 bits y tamaños de clave de 128, 192 o 256 bits. Es rapido tanto en software como en hardware y relativamente facil de implementar.

Los cifrados en bloques usan un `modo de operacion`. En criptografía, un modo de operación es un algoritmo que utiliza un cifrador por bloques para proveer seguridad a la información, como confidencialidad y autenticidad. Un modo de operación describe cómo aplicar repetidamente una operación de cifrado en un bloque simple para la transformación segura de cantidades de datos mayores que un bloque. 

La mayoría de los modos requiere una secuencia binaria única, usualmente llamada vector de inicialización (`IV`), para cada operación de encriptación. 

El método más simple de modo de cifrado es el llamado `ECB` (electronic codebook), en el cual el mensaje es dividido en bloques, cada uno de los cuales es cifrado de manera separada. No usa vector de inicializacion.

### Implementacion

Solucion en Go:
``` go
package main

import (
	"crypto/aes"
	"encoding/base64"
	"fmt"
	"os"
)

func AES_ECB_Decrypt(key, data []byte) (string, error) {
 ciph, err := aes.NewCipher(key)
 if err != nil {
   return "",err
 }
 blockSize := ciph.BlockSize()
 plaintext := make([]byte,len(data))
 for i,j := 0,blockSize; i < len(data); i,j = i+blockSize,j+blockSize {
   ciph.Decrypt(plaintext[i:j],data[i:j])
 }
 return string(plaintext),nil
}

func main() {
  b64_data,err := os.ReadFile("7.txt")
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
  plaintext, err := AES_ECB_Decrypt(key,raw_data[:l])
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(plaintext)
}
```

Solucion en Python:
```
from Crypto.Cipher import AES
import base64

def AES_ECB_Decrypt(key, data):
    cipher = AES.new(key,AES.MODE_ECB)
    plaintext = cipher.decrypt(data)
    return plaintext

try:
    with open('7.txt','r') as file:
        data = file.read()
        raw_data = base64.b64decode(data)
        key = b"YELLOW SUBMARINE"
        plaintext = AES_ECB_Decrypt(key,raw_data)
        print(plaintext.decode())

except FileNotFoundError:
    print("File not found")
```

```
I'm back and I'm ringin' the bell
A rockin' on the mike while the fly girls yell
In ecstasy in the back of me
Well that's my DJ Deshay cuttin' all them Z's
Hittin' hard and the girlies goin' crazy
Vanilla's on the mike, man I'm not lazy.

I'm lettin' my drug kick in
It controls my mouth and I begin
To just let it flow, let my concepts go
My posse's to the side yellin', Go Vanilla Go!

Smooth 'cause that's the way I will be
And if you don't give a damn, then
Why you starin' at me
So get off 'cause I control the stage
There's no dissin' allowed
I'm in my own phase
The girlies sa y they love me and that is ok
And I can dance better than any kid n' play

Stage 2 -- Yea the one ya' wanna listen to
It's off my head so let the beat play through
So I can funk it up and make it sound good
1-2-3 Yo -- Knock on some wood
For good luck, I like my rhymes atrocious
Supercalafragilisticexpialidocious
I'm an effect and that you can bet
I can take a fly girl and make her wet.

I'm like Samson -- Samson to Delilah
There's no denyin', You can try to hang
But you'll keep tryin' to get my style
Over and over, practice makes perfect
But not if you're a loafer.

You'll get nowhere, no place, no time, no girls
Soon -- Oh my God, homebody, you probably eat
Spaghetti with a spoon! Come on and say it!

VIP. Vanilla Ice yep, yep, I'm comin' hard like a rhino
Intoxicating so you stagger like a wino
So punks stop trying and girl stop cryin'
Vanilla Ice is sellin' and you people are buyin'
'Cause why the freaks are jockin' like Crazy Glue
Movin' and groovin' trying to sing along
All through the ghetto groovin' this here song
Now you're amazed by the VIP posse.

Steppin' so hard like a German Nazi
Startled by the bases hittin' ground
There's no trippin' on mine, I'm just gettin' down
Sparkamatic, I'm hangin' tight like a fanatic
You trapped me once and I thought that
You might have it
So step down and lend me your ear
'89 in my time! You, '90 is my year.

You're weakenin' fast, YO! and I can tell it
Your body's gettin' hot, so, so I can smell it
So don't be mad and don't be sad
'Cause the lyrics belong to ICE, You can call me Dad
You're pitchin' a fit, so step back and endure
Let the witch doctor, Ice, do the dance to cure
So come up close and don't be square
You wanna battle me -- Anytime, anywhere

You thought that I was weak, Boy, you're dead wrong
So come on, everybody and sing this song

Say -- Play that funky music Say, go white boy, go white boy go
play that funky music Go white boy, go white boy, go
Lay down and boogie and play that funky music till you die.

Play that funky music Come on, Come on, let me hear
Play that funky music white boy you say it, say it
Play that funky music A little louder now
Play that funky music, white boy Come on, Come on, Come on
Play that funky music
```
