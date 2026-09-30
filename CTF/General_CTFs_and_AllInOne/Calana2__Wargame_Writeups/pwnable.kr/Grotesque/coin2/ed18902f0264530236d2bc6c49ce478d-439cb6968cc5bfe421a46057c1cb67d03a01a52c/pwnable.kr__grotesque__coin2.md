# Coin 2

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/coin2.png)

Aqui hay que aplicar un poco de teoria de la informacion. Si añadimos todas las monedas que tienen el n-esimo bit activos en un grupo, entonces ese grupo aporta un bit de informacion.

Basta con pesar dos grupos a la vez ya que log_2 N es el numero de bits que posee N. Siempre que C <= log_2 N esto funciona.

Despues de pesarlos si el grupo tiene un deficit (posee la moneda falsa) entonces activamos este bit en una variable. Esta variable al final tendra los bits correctos activados y sera igual a la moneda falsa.

`NoN_4Daptiv3_b1narY_S3arcHing_1s_4ls0_3asY`