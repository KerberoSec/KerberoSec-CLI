# sudoku

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/sudoku/sudoku.png)

No tenía mucho de pwn este reto, había que implementar un solucionador de sudoku con un par de restricciones adicionales. No encontré el binario disponible, pero la tarea consiste en obtener los datos de la salida y resolver 100 de estos problemas:
```
Stage 1

[0, 7, 5, 0, 3, 0, 9, 4, 6]
[0, 8, 4, 0, 0, 5, 1, 0, 2]
[0, 0, 0, 6, 0, 1, 0, 8, 0]
[3, 0, 0, 0, 1, 0, 0, 6, 0]
[4, 0, 8, 5, 0, 3, 2, 7, 1]
[0, 1, 0, 4, 0, 0, 3, 5, 8]
[0, 0, 0, 1, 0, 0, 6, 9, 4]
[0, 0, 1, 0, 6, 0, 8, 2, 0]
[2, 0, 6, 3, 0, 9, 7, 1, 5]

- additional rule -
sum of the following numbers (at row,col) should be bigger than 20
(row,col) : (1,6)
(row,col) : (6,6)
(row,col) : (2,5)
(row,col) : (6,1)
```

La forma que se me ocurre, y creo es al más ingenua y sencilla de implementar, es un algoritmo de retroceso, algo así:
```
