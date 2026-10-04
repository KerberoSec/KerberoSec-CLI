Podemos usar `apktool d ShAPK1.apk` para descomprimir el APK.

En `AndroidManifest.xml` vemos la linea `<activity android:name="com.example.shapk1.MainActivity">`.

Nunca habia visto ensamblador smali pero con un poco de ayuda añadí comentarios al codigo mas relevante.

`smali/com/example/shapk1/MainActivity$1.smali`, en el metodo onClick:
``` smali
    # Toma el texto en el input y lo almacena en p1
    invoke-virtual {p1}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object p1
    # Convierte el texto en un String
    invoke-virtual {p1}, Ljava/lang/Object;->toString()Ljava/lang/String;
  
    move-result-object p1

    .line 59
    # v1 ahora es una estancia de MainActivity
    iget-object v1, p0, Lcom/example/shapk1/MainActivity$1;->this$0:Lcom/example/shapk1/MainActivity;
    # Obtiene acceso a los recursos de la app y lo almacena en v1
    invoke-virtual {v1}, Lcom/example/shapk1/MainActivity;->getResources()Landroid/content/res/Resources;

    move-result-object v1
    # Carga el ID del recurso en v2
    const v2, 0x7f0c001f
    # Obtiene el string asociado a ese ID y lo almacena en v1
    invoke-virtual {v1, v2}, Landroid/content/res/Resources;->getString(I)Ljava/lang/String;

    move-result-object v1
 
    .line 60
    # Convierte el texto de v1 en un arreglo de bytes UTF-8
    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;
    
    invoke-virtual {v1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object v1

    .line 61
    # Convierte el texto de p1 en un arreglo de bytes UTF-8
    sget-object v2, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object p1

    .line 62
    # v2 ahora es una instancia de MainActivity
    iget-object v2, p0, Lcom/example/shapk1/MainActivity$1;->this$0:Lcom/example/shapk1/MainActivity;
    
    # Llama a encrypt en MainActivity.smali con argumento p1 y almacena el resultado en p1
    invoke-virtual {v2, p1}, Lcom/example/shapk1/MainActivity;->encrypt([B)[B

    move-result-object p1

    # Almacena 2 en v2, esto es el modo de operacion de Base64 (Base64.NO_WRAP)
    const/4 v2, 0x2

    .line 631
    # Codifica en base64 la entrada de usuario encriptada y la almacena en p1
    invoke-static {p1, v2}, Landroid/util/Base64;->encode([BI)[B

    move-result-object p1

    .line 65
    # Compara Base64.encode(encrypt(user_input)) == res.Resources(ID=0x7f0c001f) y almacena el resultado en p1
    invoke-static {p1, v1}, Ljava/util/Arrays;->equals([B[B)Z

    move-result p1
    # Si es false(0) saltar a la etiqueta :cond_0
    if-eqz p1, :cond_0

    const-string p1, "YES! PASSWORD IS CORRECT!!"

    .line 67
    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    goto :goto_0
    
    :cond_0
    const-string p1, "PASSWORD IS WRONG!!"
```

`smali/com/example/shapk1/MainActivity$1.smali`, en el metodo encrypt:
``` smali
    .line 29
    # Obtiene el recurso con ID=0x7f0c001d y lo almacena en v0
    invoke-virtual {p0}, Lcom/example/shapk1/MainActivity;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    const v1, 0x7f0c001d

    invoke-virtual {v0, v1}, Landroid/content/res/Resources;->getString(I)Ljava/lang/String;

    move-result-object v0

    .line 30
    # Convierte el string en un array de bytes UTF_8 y lo almacena en v0
    sget-object v1, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {v0, v1}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object v0

    .line 32
    # Obtiene la longitud de v0 y la almacena en v1
    array-length v1, v0

    .line 33
    # Obtiene la longitud de p1 y la almacena en v2
    array-length v2, p1
    # Crea un nuevo arreglo de v2 bytes y lo guarda en v2
    new-array v2, v2, [B
    # Guarda 0 en v3
    const/4 v3, 0x0

    .line 34
    # Inicio del bucle
    :goto_0
    # Extrae la longitud de p1 y la almacena en v4
    array-length v4, p1
    # Si v3 >= v4 terminar
    if-ge v3, v4, :cond_0
    
    .line 36 
    # v4 = p1[v3]
    aget-byte v4, p1, v3
    # v5 = v3 % v1
    rem-int v5, v3, v1
    # v5 = v0[v5]
    aget-byte v5, v0, v5
    # v4 = v4 ^ v5
    xor-int/2addr v4, v5
    # v4 = byte(v4)
    int-to-byte v4, v4
    # v2[v3] = v4 
    aput-byte v4, v2, v3
    # v3 = v3 + 1
    add-int/lit8 v3, v3, 0x1
    # Proxima iteracion
    goto :goto_0
    # Fin del bucle
    :cond_0
    return-object v2
```

Para encontrar el contenido de los recursos con un determinado ID buscamos primero su nombre en `res/values/public.xml` y luego su valor en `res/values/strings.xml`:

<img width="666" height="158" alt="2025-08-08-140629_666x158_scrot" src="https://github.com/user-attachments/assets/e49eedae-ef9d-4815-b7f5-52c72db78331" />

<img width="559" height="209" alt="2025-08-08-140836_559x209_scrot" src="https://github.com/user-attachments/assets/09ca710a-7ef4-4423-8aac-21890426cf79" />

Como XOR es reversible si aplicamos encrypt a un "secret" base64-decodificado recuperamos la entrada correcta:
``` py
import base64
cipher = base64.b64decode("NQALCgEDDDEzUjpTBwocBgcDPTIIGwIK")
key = b"beginning"
result = [];
for i in range(len(cipher)):
    result.append(cipher[i] ^ key[i % len(key)])
print("".join(chr(b) for b in result))
```

`Welcome_T0_4ndroid_World`

![Screenshot_20250808-143358_ShAPK1](https://github.com/user-attachments/assets/c8f701de-1f5c-4595-bee7-8ff34225db11)

