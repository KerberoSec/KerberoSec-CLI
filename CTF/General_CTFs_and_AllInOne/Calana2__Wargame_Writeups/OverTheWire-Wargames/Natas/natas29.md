# Natas 29

#### URL: natas29.natas.labs.overthewire.org
#### Credenciales: natas29:31F4j3Qi2PnuhIZQokxXk1L3QT9Cppns

Existe una inyeccion remota de comandos en el parametro file si lo hacemos a traves de una tuberia y lo terminamos con un null byte:

![2025-03-21-140848_1366x389_scrot](https://github.com/user-attachments/assets/2a172d6b-986a-47b0-8ece-b68135d491f9)

Sin embargo parece que no podemos escribir la palabra 'natas' sin que se entere:

![2025-03-21-140759_1161x422_scrot](https://github.com/user-attachments/assets/33451b62-084c-4d04-8ae2-53ee4f737307)

Podemos usar comodines como '*' o '?' para hacer coincidir nuestro archivo:

![2025-03-21-141055_1366x411_scrot](https://github.com/user-attachments/assets/72cfaa55-1b4b-4e19-b61d-7fdf19fafeee)

`natas30:WQhx1BvcmP9irs2MP9tRnLsNaDI76YrH`
