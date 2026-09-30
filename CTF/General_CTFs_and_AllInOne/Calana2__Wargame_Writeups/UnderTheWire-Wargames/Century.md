# Century

Decidí no usar alias aquí para sentirme más cómodo con los nombres reales de los comandos.

## Century 1
`century1:century1`

## Century 2
La variable global `PSVersionTable` contiene la version de compilacion de Powershell
```ps
($PSVersionTable).BuildVersion.toString()
```

`century2:10.0.14393.7870`

## Century 3
El comando que es como `wget` en Powershell es `Invoke-WebRequest`, alias `iwr`.
```ps
'invoke-webrequest' + (Get-ChildItem).Name
```

`century3:invoke-webrequest443`

## Century 4
```ps
(Get-ChildItem | Measure-Object).Count
```

`century4:123`

## Century 5
``` ps
 Set-Location "Can You Open Me"; Get-ChildItem
```

`century5:15768`

## Century 6
```ps
 (Get-ADDomain).Name + (Get-ChildItem).Name
```

`century6:underthewire3347`

## Century 7
```ps
 (Get-ChildItem -Directory).Count
```

`century7:197`

## Century 8
```ps
Get-ChildItem -Recurse -File -Filter '*read*' .. | Get-Content
```

`century8:7points`

## Century 9
```ps
(Get-Content unique.txt | Sort-Object -Unique).Count
```

`century9:696`

## Century 10
```ps
(Get-Content Word_File.txt).Split(' ')[160]
```

`century10:pierid`

## Century 11
Si googleamos "Windows User service 2016 short name" nos aparece `wuavuserv`. Con Get-CimInstance obtenemos los objetos de la clase `win32_service`. 
```ps
((Get-CimInstance win32_service -Filter 'Name = "wuauserv"').Description.Split(' ')[9,7].toLower() -join '') + (Get-ChildItem).Name
```

`century11:windowsupdates110`

## Century 12
``` ps
Get-ChildItem -Hidden -Recurse -File -ErrorAction SilentlyContinue | Select-Object -Unique Name
```

`century12:secret_sauce`

## Century 13
Obtenemos el nombre del DC con `GetADDomainController` y obtenemos la descripcion de la computadora DC con `Get-ADComputer`.
```ps
(Get-ADComputer -Identity (Get-ADDomainController).Name -Properties Description).Description + (Get-ChildItem).Name
```

`century13:i_authenticate_things`

## Century 14
```ps
(cat countmywords).Split(' ').Count
```

`century14:755`

## Century 15
La opcion `-Raw` convierte la salida a una sola linea. 

En regex "\b" significa "word boundary", es decir, verifica que este separada de caracteres que conforman palabras.
```ps
(Get-Content -Path "countpolos" -Raw | Select-String -Pattern "\bpolo\b" -AllMatches).Matches.Count
```

`century15:158`
