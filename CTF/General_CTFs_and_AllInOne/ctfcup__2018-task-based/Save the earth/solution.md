### 2 Использование карт для разделения секрета

###### 1 Запускаем сервис локально

Устанавливаем и проверяем с подключенной картой:

```
$ python3 -m venv .venv
$ source ./.venv/bin/activate
$ python3 -m pip install will_service*.whl
$ python3 -m service
Waiting for a card...
Reading card data
Restoring secret
Publishing will
{factory_share: 70, will_decryption_key: 0a0e0456aa012030}
Please unplug the card
The card is unplugged
```

Проверяем, что со всеми картами результат одинаковый

###### 2 Разбираемся с исходниками

Краткое содержание:
1. С карты при помощи pkcs11-tool берется PKCS#11 data object с меткой "share".
2. Данные в файле защищены подписью, происходит проверка подписи.
3. Данные на карте как-то комбинируются с данными из файла fixed_shares.txt, так что получается сообщение `{factory_share: 70, will_decryption_key: 0a0e0456aa012030}`. 
4. Если бы сообщение было `{factory_share: 15, will_decryption_key: 0a0e0456aa012030}`, нам показали бы флаг.

Обнаруживаем:
1. Алгоритм. выполняющийся в шаге 3: это разделение секрета по схеме Шамира (https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing). Две точки на кривой фиксированы в файле `fixed_shares.txt`, одна берется с карты.
2. Подписью в защищаются не все данные с карты, а только координата `y` и модуль `p`, значит data-объект, в котором будет другая координата `x`, тоже будет валидным.

###### 3 Решаем математику

1. Знаем, что из 3 точек на кривой можно восстановить секрет: координату `y` на кривой при `x=0`
2. Найдем коэффициенты `[an, bn, cn]` кривой `y = a*x**2 + b*x + c`, так чтобы она проходила через фиксированные точки из  `fixed_shares.txt` и через точку `[0, int("0x" + binascii.hexlify("{factory_share: 15, will_decryption_key: 0a0e0456aa012030}") % p, 16)]`. Это решение системы из двух линейных уравнений: легко.
3. Возьмем точку `[xk, yk]`, хранящуюся на карте. Найдем `xkn`, такой чтобы точка `[xkn, yk]` находилась на кривой, заданной коэффициентами `[an, bn, cn]`. Для этого придется решить квадратное уравнение.
4. Обнаружим, что квадратное уравнение решается с координатой `y`, указанной только на одной из карт, которые есть у команды. В остальных случаях в уравнении `x**2 = n mod p` получается, что `n`: квадратичный невычет.

###### 4 Фиксируем результат

При помощи pkcs11-tool удаляем с карты старый объект и записываем новый.

```
pkcs11-tool --module ./librtpkcs11ecp.dylib  -y data -a share -b
pkcs11-tool --module ./librtpkcs11ecp.dylib  -y data -a share -w new_data.txt
```

Убеждаемся, что сервис локально показывает фейковый флаг:

```
python3 -m service
Waiting for a card...
Reading card data
Restoring secret
Publishing will
{factory_share: 15, will_decryption_key: 0a0e0456aa012030}
The flag is CupCTF{THIS_IS_NOT_REAL_FLAG}
Please unplug the card
```

Идем на выделенную машину организаторов, вставляем карту там и получаем флаг.
