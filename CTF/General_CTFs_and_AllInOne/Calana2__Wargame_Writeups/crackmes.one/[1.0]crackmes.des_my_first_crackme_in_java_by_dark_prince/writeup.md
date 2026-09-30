Usamos [un decompilador de Java](http://java-decompiler.github.io/) para mostrar el codigo fuente de los archivos .class del jar.

Vemos que la funcion main: 

- Crea una variable "sum" que es la suma de los valores ASCII de las letras del campo Name.
- Crea un objeto de la clase "Dark" y le pasa a su metodo "StrM" el valor del campo Country, el valor del campo Key y la variable "Sum".
- dr.StrM(str2,cmp,sum) realiza un conjunto de operaciones con "str1", "sum"y variables locales para crear un valor "y2" que compara con "sum".

<img width="891" height="641" alt="2025-08-07-174540_891x641_scrot" src="https://github.com/user-attachments/assets/26abf5ac-385f-48ec-a938-f096bc189354" />

<img width="896" height="660" alt="2025-08-07-181311_896x660_scrot" src="https://github.com/user-attachments/assets/cf573d00-093f-41f0-8aa2-05a4f4a35e81" />

Podemos implementar esto en Python para producir una clave valida a partir de estos parametros:
```py
class PermutationGenerator:
    def __init__(self, word):
        self.word = word
    
    def get_permutations(self):
        result = []
        if len(self.word) == 0:
            result.append(self.word)
            return result
        
        for i in range(len(self.word)):
            shorter_word = self.word[:i] + self.word[i+1:]
            shorter_permutation_generator = PermutationGenerator(shorter_word)
            shorter_word_permutations = shorter_permutation_generator.get_permutations()
            for s in shorter_word_permutations:
                result.append(self.word[i] + s)
        return result

def done_action(name, country):
    str2 = None
    m = 0
    sum= 0  
    
    if country is not None:
        str2 = str(country)
    
    for char in name:
        if char.isalpha():
            m = ord(char)  
            sum += m
    return {
        's1': str2,
        'c1': sum
    }

def str_m(s1, c1):
    s1 = s1[:5]
    pm = PermutationGenerator(s1)
    permut = pm.get_permutations()
    
    s2 = permut[3]
    s3 = permut[10]
    s4 = permut[17]
    
    ch1 = s2[3]
    ch2 = s3[3]
    ch3 = s4[3]
    
    n1 = ord(ch1)
    n2 = ord(ch2)
    n3 = ord(ch3)
    
    c1 <<= 2
    c2 = c1 & 0xFF
    c3 = c1 ^ c2
    c4 = c1 | c3
    
    d = c2 * 2 + c3 * 3 + c4 * 4 + n1 * 10 + n2 * 11 + n3 * 12
    s5 = str(d)
    s6 = s5
    s5 = s5[:2]
    
    y = int(s5)
    y1 = int(s6)
    
    a = [[2, 2, y], [4, 6, 2], [3, 4, 4]]
    b = [[2, 2, 3], [8, 9, 5], [6, 2, 2]]
    c = [[0 for _ in range(3)] for _ in range(3)]
    
    for i in range(3):
        for j in range(3):
            c[i][j] = 0
            for k in range(3):
                c[i][j] = c[i][j] + a[i][k] * b[k][j]
    
    y2 = c[2][2]
    y2 *= y1
    
    print("Name: s1s1f0")
    print("Country: Australia")
    print("Key: ", y2)

values = done_action(name="s1s1f0",country="Australia") 
str_m(values['s1'], values['c1'])
```

```
$ python3 solve.py
Name: s1s1f0
Country: Australia
Key:  483035
```

<img width="1340" height="706" alt="2025-08-07-182234_1340x706_scrot" src="https://github.com/user-attachments/assets/0548b4c5-6e99-47b2-8c0b-05d59f2d485c" />

