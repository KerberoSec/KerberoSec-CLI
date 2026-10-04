La funcion "naked" realiza la verificacion con "username" y "licence_key". Valida que `(len(username)<=6 && len(licence_key)>8)` e invoca a `catg1(char* username , char* licence_key)`

<img width="596" height="292" alt="2025-08-08-092018_596x292_scrot" src="https://github.com/user-attachments/assets/75770990-ac60-4184-9382-2da498fdb89b" />

La funcion "catg1" crea un arreglo local basado en "username", realiza un par de operaciones con cada caracter y compara con parte de "licence_key".

<img width="592" height="648" alt="2025-08-08-092939_592x648_scrot" src="https://github.com/user-attachments/assets/c08b431c-b984-420b-9f20-4df07d9afdd2" />

Podemos implementar esto en Python:
```py
def catg1(username):
    assert len(username) <= 6
    local_40 = [0] * 4
    licence_ley = []
    for i in range(3):
        char = ord(username[i])
        local_40[i] = char * 5
    # Calculate all the required values
    licence_ley.append((local_40[0] // 100) + 0x30)
    licence_ley.append(((local_40[0] // 10) % 10) + 0x30)
    licence_ley.append((local_40[0] % 10) + 0x30)

    licence_ley.append((local_40[1] // 100) + 0x30)
    licence_ley.append(((local_40[1] // 10) % 10) + 0x30)
    licence_ley.append((local_40[1] % 10) + 0x30)

    licence_ley.append((local_40[2] // 100) + 0x30)
    licence_ley.append(((local_40[2] // 10) % 10) + 0x30)
    licence_ley.append((local_40[2] % 10) + 0x30)

    print("".join(chr(c) for c in licence_ley))
catg1("s1s1f0")
# 575245575
```

<img width="1024" height="768" alt="chall8" src="https://github.com/user-attachments/assets/f7c33667-b1bc-4b99-be12-3cd9849296f9" />
