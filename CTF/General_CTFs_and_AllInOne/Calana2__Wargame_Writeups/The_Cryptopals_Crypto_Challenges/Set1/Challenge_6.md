# Break repeating-key XOR

![2025-04-09-161339_1061x316_scrot](https://github.com/user-attachments/assets/bef2aee6-2f2a-4f0a-aba5-e0920d7c36a7)

### Distancia de Hamming
Primero debemos crear y probar una funcion que calcule la distancia de Hamming entre dos cadenas (la sumatoria del numero de bits diferentes entre cada par de bytes)

Solucion en Go:
``` go
package main

import (
  "fmt"
)

// Bit difference measure
func Hamming_distance(a []byte, b []byte) (int, error) {
 if len(a) != len(b) {
  return 0, fmt.Errorf("Params must have the same length ")
 }
 distance := 0
 for i:=0; i<len(a); i++ {
  xor := a[i] ^ b[i]
  for xor != 0 {
   distance += int(xor & 1)
   xor >>= 1
  }
 }
 return distance,nil
}

func main() {
  d,_ := Hamming_distance([]byte("this is a test"),[]byte("wokka wokka!!!"))
  print(d)
}
```

### Obtener el mejor KEYSIZE
Para los pasos 3 y 4:
``` go
package main

import (
	"encoding/base64"
	"fmt"
	"math"
	"os"
)

// Bit difference measure
func Hamming_distance(a []byte, b []byte) (int, error) {
	if len(a) != len(b) {
		return 0, fmt.Errorf("Params must have the same length ")
	}
	distance := 0
	for i := 0; i < len(a); i++ {
		xor := a[i] ^ b[i]
		for xor != 0 {
			distance += int(xor & 1)
			xor >>= 1
		}
	}
	return distance, nil
}

func main() {
	// Leer el archivo
	f, err := os.ReadFile("6.txt")
	data := make([]byte, len(f))
	if err != nil {
		fmt.Println("Error reading the file: ", err)
		return
	}
	_, err = base64.StdEncoding.Decode(data, f)
	if err != nil {
		fmt.Println("Error decoding the file: ", err)
		return
	}

	// Encontrar el mejor keysize
	best_keysize := 2
	min_normalized_distance := math.MaxFloat64
	for KEYSIZE := 2; KEYSIZE <= 40; KEYSIZE++ {
    num_blocks := 10
		total_hd := 0
  /* Comparamos num_blocks bloques de tamaño KEYSIZE
     Hallamos la distancia de Hamming para cada par de bloques y las sumamos */
		for i := 0; i < num_blocks; i++ {
			block1 := data[i*KEYSIZE : (i+1)*KEYSIZE]
			block2 := data[(i+1)*KEYSIZE : (i+2)*KEYSIZE]
			hd, _ := Hamming_distance(block1, block2)
			total_hd += hd
		}
   
    // Dividimos las sumas de las distancias entre el tamaño de bloque * KEYSIZE (normalizacion)
		normalized_distance := float64(total_hd) / float64(KEYSIZE*num_blocks)
		fmt.Printf("KEYSIZE: %d, Normalized HD: %.2f\n", KEYSIZE, normalized_distance)

		if normalized_distance < min_normalized_distance {
      // Buscamos la distancia minima y guardamos el valor de KEYSIZE pmas probable
			min_normalized_distance = normalized_distance
			best_keysize = KEYSIZE
		}
	}
  fmt.Println("Mejor KEYSIZE:", best_keysize)
}
```

Notese que num_blocks esta establecido a 10, porque al principio, si comparaba pocos bloques los KEYSIZES mas probables variaban: 
[`2`,`5`,`29`]

A partir de comparar 10 pares de bloques hasta 30 se mantuvo `29` como el KEYSIZE definitivo

### Crear bloques de KEYSIZE y transponerlos
``` go

	// Dividir el texto en KEYSIZE 29
	var blocks [][]byte
	for i := 0; i < len(data); i += best_keysize {
		end := i + best_keysize
		if end > len(data) {
			end = len(data)
		}
		blocks = append(blocks, data[i:end])
	}

	// Transponer los bloques
	var transposed [][]byte
	for i := 0; i < best_keysize; i++ {
		var newBlock []byte
		for _, block := range blocks {
			if i < len(block) {
				newBlock = append(newBlock, block[i])
			}
		}
		transposed = append(transposed, newBlock)
         }
```

### Encontrando el mejor histograma para cada bloque

Un histograma es lo mismo que un analisis de frecuencia de caracteres, debemos hacer una funcion que calcule una puntuacion basada en esa frecuencia para cada bloque:
``` go
package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"math"
	"os"
)

// English score
var english_frequencies = map[byte]float64{
	'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 7.31, 'N': 6.95,
	'S': 6.28, 'H': 6.09, 'R': 5.99, 'D': 4.32, 'L': 4.03, 'U': 2.88,
	'C': 2.71, 'M': 2.61, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'P': 1.82,
	'Y': 1.75, 'B': 1.49, 'V': 1.11, 'K': 0.69, 'X': 0.17, 'J': 0.10,
	'Q': 0.10, 'Z': 0.07, ' ': 13.00,
}

func scoreText(text []byte) float64 {
	score := 0.0
	total_letters := 0
  letter_count := make(map[byte]float64)
	for _, c := range text {
		// Convertir a mayúscula y buscar en frecuencias
		char := bytes.ToUpper([]byte{c})[0]
		if _, ok := english_frequencies[char]; ok {
			letter_count[char] += 1
			total_letters += 1
		}
	}
	if total_letters != 0 {
    // Puntuar usando chi-cuadrado
		for char, observed := range letter_count {
			expected := english_frequencies[char] * float64(total_letters)
			diff := observed - expected
			score += (diff * diff) / expected
		}
	}

	return score
}

// Bit difference measure
func Hamming_distance(a []byte, b []byte) (int, error) {
	if len(a) != len(b) {
		return 0, fmt.Errorf("Params must have the same length ")
	}
	distance := 0
	for i := 0; i < len(a); i++ {
		xor := a[i] ^ b[i]
		for xor != 0 {
			distance += int(xor & 1)
			xor >>= 1
		}
	}
	return distance, nil
}

func main() {
	// Leer el archivo
	f, err := os.ReadFile("6.txt")
	data := make([]byte, len(f))
	if err != nil {
		fmt.Println("Error reading the file: ", err)
		return
	}
  // Decodificar base64
  decodeLen, err := base64.StdEncoding.Decode(data, f)
	if err != nil {
		fmt.Println("Error decoding the file: ", err)
		return
	}
  data = data[:decodeLen]

	// Encontrar el mejor keysize
	best_keysize := 2
	min_normalized_distance := math.MaxFloat64
	for KEYSIZE := 2; KEYSIZE <= 40; KEYSIZE++ {
		num_blocks := 10
		total_hd := 0

		for i := 0; i < num_blocks; i++ {
			block1 := data[i*KEYSIZE : (i+1)*KEYSIZE]
			block2 := data[(i+1)*KEYSIZE : (i+2)*KEYSIZE]
			hd, _ := Hamming_distance(block1, block2)
			total_hd += hd
		}

		normalized_distance := float64(total_hd) / float64(KEYSIZE*num_blocks)

		if normalized_distance < min_normalized_distance {
			min_normalized_distance = normalized_distance
			best_keysize = KEYSIZE
		}
	}

	// Dividir el texto en KEYSIZE 29
	var blocks [][]byte
	for i := 0; i < len(data); i += best_keysize {
		end := i + best_keysize
		if end > len(data) {
			end = len(data)
		}
		blocks = append(blocks, data[i:end])
	}

	// Transponer los bloques
	var transposed [][]byte
	for i := 0; i < best_keysize; i++ {
		var newBlock []byte
		for _, block := range blocks {
			if i < len(block) {
				newBlock = append(newBlock, block[i])
			}
		}
		transposed = append(transposed, newBlock)
	}

	// Probar cada byte como clave de cada bloque y puntuar
	var key []byte
	for _, block := range transposed {
		bestScore := 0.0
		bestByte := byte(0)
		for i := 0; i <= 255; i++ {
			candidate := byte(i)
			// XOR
			decrypted := make([]byte, len(block))
			for j := range block {
				decrypted[j] = block[j] ^ candidate
			}
			// Puntuar
			score := scoreText(decrypted)
			if score > bestScore {
				bestScore = score
				bestByte = candidate
			}
		}
		key = append(key, bestByte)
	}
	fmt.Println("====== Clave encontrada ======\n", string(key))

	// Decodificar el texto con la clave
	decrypted := make([]byte, len(data))
	for i := range data {
		decrypted[i] = data[i] ^ key[i%len(key)]
	}
	fmt.Println("====== Texto decodificado ======\n", string(decrypted))
}

```

Solucion en python:
``` python
import math
import base64
FILENAME = "6.txt"

# Frecuencias del inglés
english_frequencies = {
    'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 7.31, 'N': 6.95,
    'S': 6.28, 'H': 6.09, 'R': 5.99, 'D': 4.32, 'L': 4.03, 'U': 2.88,
    'C': 2.71, 'M': 2.61, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'P': 1.82,
    'Y': 1.75, 'B': 1.49, 'V': 1.11, 'K': 0.69, 'X': 0.17, 'J': 0.10,
    'Q': 0.10, 'Z': 0.07, ' ': 13.00
}

# Calcular el puntaje del texto según frecuencias esperadas
def english_score(data):
    letter_counts = {}
    total_letters = 0
    for byte in data:
        char = chr(byte).upper()
        if 'A' <= char <= 'Z' or char == ' ':
            letter_counts[char] = letter_counts.get(char, 0) + 1
            total_letters += 1
    
    score = 0
    if total_letters > 0:
        for char, freq in english_frequencies.items():
            observed = letter_counts.get(char, 0)
            score += observed * freq  # Ponderación directa según frecuencia
            score -= abs(observed / total_letters - freq) / 10  # Penalización
    
    return score

# Calcular distancia de Hamming
def hamming_distance(bytes1, bytes2):
    if len(bytes1) != len(bytes2):
        raise ValueError("Arrays must have the same length")
    return sum(bin(b1 ^ b2).count('1') for b1, b2 in zip(bytes1, bytes2))

# Leer archivo y calcular distancia de Hamming normalizada
def normalized_hamming_distance(data, blocksize):
    n_blocks = len(data) // (blocksize * 2)
    hd_normalized = sum(
        hamming_distance(data[i * blocksize:(i + 1) * blocksize],
                         data[(i + 1) * blocksize:(i + 2) * blocksize]) / blocksize
        for i in range(n_blocks)
    )
    return hd_normalized / n_blocks

# Dividir bloques y transponerlos
def get_trans_blocks(data, keysize):
    blocks = [data[i:i + keysize] for i in range(0, len(data), keysize)]
    transposed = []
    for i in range(keysize):
        transposed.append(bytearray(block[i] for block in blocks if len(block) > i))
    return transposed

# XOR simple
def single_xor(msg, key):
    return bytes(byte ^ key for byte in msg)

# --- MAIN ---
if __name__ == "__main__":
    try:
        # Leer archivo una vez
        with open(FILENAME, "rb") as file:
            data = file.read()
            data = base64.b64decode(data)

        # Encontrar KEYSIZE óptimo
        keysize_data = {"hamming_distance": math.inf, "keysize": 0}
        for keysize in range(2, 41):
            hd = normalized_hamming_distance(data, keysize)
            if hd < keysize_data["hamming_distance"]:
                keysize_data["hamming_distance"] = hd
                keysize_data["keysize"] = keysize
        
        print(f"The key length is: [{keysize_data['keysize']}]")

        # Dividir en bloques y transponer
        blocks = get_trans_blocks(data, keysize_data["keysize"])

        # Encontrar clave por bloque
        key = bytearray()
        for block in blocks:
            best_score = -math.inf
            best_char = 0
            for candidate in range(256):
                decrypted = single_xor(block, candidate)
                score = english_score(decrypted)
                if score > best_score:
                    best_score = score
                    best_char = candidate
            key.append(best_char)

        print(f"The key is: [{key.decode('latin1')}]")

        # Decodificar el texto usando la clave encontrada
        decrypted_data = bytearray(len(data))
        for i, byte in enumerate(data):
            decrypted_data[i] = byte ^ key[i % len(key)]

        print("====== Texto decodificado ======")
        print(decrypted_data.decode('ascii', errors='ignore'))

    except Exception as e:
        print(f"Error: {e}")
```

``` 
 go run 6.go
====== Clave encontrada ======
 Terminator X: Bring the noise
====== Texto decodificado ======
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
