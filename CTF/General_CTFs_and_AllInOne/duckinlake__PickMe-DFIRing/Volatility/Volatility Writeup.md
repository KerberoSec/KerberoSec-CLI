# [0x00] Scenarious
### Case 001: BOB! THIS ISN'T A HORSE!
Your SOC has informed you that they have gathered a memory dump from a quarantined endpoint thought to have been compromised by a banking trojan masquerading as an Adobe document. Your job is to use your knowledge of threat intelligence and reverse engineering to perform memory forensics on the infected host. 

You have been informed of a suspicious IP in connection to the file that could be helpful. `41.168.5.140`

The memory file is located in `/Scenarios/Investigations/Investigation-1.vmem`'

### Case 002: That Kind of Hurt my Feelings
You have been informed that your corporation has been hit with a chain of ransomware that has been hitting corporations internationally. Your team has already retrieved the decryption key and recovered from the attack. Still, your job is to perform post-incident analysis and identify what actors were at play and what occurred on your systems. You have been provided with a raw memory dump from your team to begin your analysis.

The memory file is located in `/Scenarios/Investigations/Investigation-2.raw`

# [0x01] Case 001
Переходим в директорию `/Scenarios/Investigations`, файл `Investigation-1.vmem` лежит там. По разрешению понятно, что образ снят с гипервизора VMware.
В работе будем использовать Volatility: [open-sorce](http://href="https://github.com/volatilityfoundation/volatility/) фреймворк, который развивается сообществом. Написан на питоне и работает с модульной архитектурой: есть плагины, которые можно подключать для анализа. Полный список плагинов, которые доступны из коробки можно посмотреть с помощью `vol -h`.
Поскольку нам неизвестна ОС системы, попробуем вытащить эту информацию при помощи `strings`: применим к файлу и грепнем по `linux`, а потом по `windows`
```sh
strings -f /Scenarios/Investigations/Investigation-1.vmem | grep linux
strings -f /Scenarios/Investigations/Investigation-1.vmem | grep windows
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img1.png)

Видим, что система была на Windows.
Теперь, зная ОС, собираем базовую информацию про образ при помощи плагина `windows.info`. 
```sh
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.info
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img2.png)

На скриншоте выше видно значение `NtBuildLab` - `2600.xpsp.080413-2111`, которое показывает точную версию, ветку исходного кода и дату компиляции ядра операционной системы. Это значение соответствует билду: Microsoft Windows XP Service Pack 3, полный номер сборки 5.1.2600.5512.

What is the build version of the host machine in Case 001?
> 2600.xpsp.080413-2111 

На этом же скрине указано SystemTime: показывает, когда образ был сделан.

At what time was the memory file acquired in Case 001?
>2012-07-22 02:45:08

Далее рассмотрим процессы. 
```bash
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.pslist
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.psscan
```
При сравнение выводы `windows.pslist` (обходит двусвязный список `ActiveProcessLinks` в структуре `_EPROCESS`, это тот же список, который показывает Windows Task Manager) и `windows.psscan` (поиск структур данных, которые матчатся с  `_EPROCESS`)  выдадут одинаковое количество процессов, что говорит о том, что скорее всего скрытых из таблицы процессов нет. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img3.png)

Далее рассмотрим в виде дерева процессов. 
```shell
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.pstree
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img4.png)

Большинство процессов выглядят легитимно, и их связи соответствуют тому, какими должны быть. Ниже схема того, кто кому приходится родителем в Windows процессах

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img5.png)

При рассмотрение процессов нестандартными (неизвестными) мне показались несколько: `wuauclt.exe`, `alg.exe` и `reader_sl.exe`, поискав информацию:
- `wuauclt.exe`: клиент системы автообновления  Windows. Программа работает в фоновом режиме и периодически подключается с серверу обновлений Microsoft для обновление операционной системы, приложений и драйверов.
- `alg.exe`: служба операционной системы Microsoft Windows. Она является ядром для Microsoft Windows Internet Connection sharing и Internet connection firewall. Также эту службу используют некоторые сторонние межсетевые экраны.
- `reader_sl.exe`: процесс, который используется программой Adobe Reader для уменьшения времени загрузки PDF документа.

Первые два процесса действительно являются легитимными сервисами с правильными родителями, однако родителем третьего является Проводник (легитимный, без "живого" родителя и с той же сессией, что и существующий `winlogon.exe`), когда по описанию это явно должен быть Adobe Reader. Следовательно, это и есть подозрительный процесс из вопроса. Сразу отвечаем на четыре вопроса к нему.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img6.png)

What process can be covolnsidered suspicious in Case 001?  
Note: Certain special characters may not be visible on the provided VM. When doing a copy-and-paste, it will still copy all characters.
> reader_sl.exe 

What is the parent process of the suspicious process in Case 001?
> explorer.exe

What is the PID of the suspicious process in Case 001?
> 1640

What is the parent process PID in Case 001?
>1484

Изучим процесс. Он запускается из легитимной директории Adobe Reader, но при этом, что подозрительно, подгружены библиотеки для работы Windows Sockets (`WS2_32.dll`, `WS2HELP.dll`).
```sh
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.dlllist
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img7.png)

Процесс запущен от имени пользователя Robert, который при этом имеет права локального администратора на машине.
```sh
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.envars --pid 1640
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.getsids --pid 1640
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img8.png)

Остальные проверки (handles...) не показали супер-интересной информации. Сдампим виртуальное адресное пространство процесса при помощи плагина `.memmap`, чтобы понять, что находилось внутри памяти процесса в моменте снятия дампа ВМ (там может быть код программы, подгруженные DLL, сетевые данные и тд).
```sh
vol -f  /Scenarios/Investigations/Investigation-1.vmem windows.memmap --pid 1640 --dump
```

> в данном кейсе программу стоит запускать из домашней директории пользователя, чтобы были права на запись, иначе volatility не сможет создать файл с самим дампом

Извлекаю строки из дампа процесса при помощи strings.
```sh
strings pid.1640.dmp >> 1640str
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img9.png)

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img10.png)

Файл большой (301725 строк если прогнать через `wc`), однако если изучить начало, то можно найти подозрительные фрагменты с перечислением доменов различных банков, а также, проверкой веб-страниц по шаблону и при срабатывании: дальнейшая логика с кражей данных. Схема работы напоминает банковский троян, который как раз-таки ожидает обращения к банковским сервисам, далее перехватывает данные пользователя (логин, пароль, временные коды доступа) и перенаправляет на хост злоумышленника.
Перейдем к вопросам. Первый спрашивает про то, какой user-agent использовался злоумышленником. Грепаем из файла любые совпадение с User-agent:
```sh
cat 1640str | grep -i "user-agent"
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img11.png)

И находим искомый user-agent. Подробнее рассмотрим в каком контексте он используется.
```sh
cat 1640str | grep -i -A50 -B3 "user-agent: Mozilla"
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img12.png)
Указывает, по всей видимости, на еще один хост злоумышленника.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img13.png)

Кстати, оба адреса при прогоне через VirusTotal будут выявляться некоторыми вендорами как вредоносные.

What user-agent was employed by the adversary in Case 001?
>Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)

В последнем вопросе спрашивается про присутствие Chase Bank в доменах. Грепаем по домену и видим его. 
```sh
cat 1640str | grep -i "chase"
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img14.png)

Was Chase Bank one of the suspicious bank domains found in Case 001? (Y/N)
>Y
# [0x02] Case 002
В директории `/Scenarios/Investigations` находится файл `Investigation-2.raw` в формате `.raw` - сырые данные. При помощи `strings` вытащим тип ОС, как в предыдущем кейсе.
```sh
strings -f /Scenarios/Investigations/Investigation-2.raw | grep linux
strings -f /Scenarios/Investigations/Investigation-2.raw | grep windows
```
По выводу определяем, что ОС: windows.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img15.png)

Используя плагин `windows.info` собираем первичную информацию о системе. 
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.info
```
Значение `NtBuildLab` - `2600.xpsp.sp3.qfe.130704-0421` соответствует билду Microsoft Windows XP Build 2600.6419 with Service Pack 3 Update. Видно SystemTime: когда был снят образ.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img16.png)

Переходим к процессам, для удобства сразу строим дерево:
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.pstree
```
Системные процессы являются легитимными. Проверим запущенные из Проводника.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img17.png)

Узнаем, откуда запущены процессы при помощи плагина `windows.cmdline`
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.cmdline --pid 1956
vol -f /Scenarios/Investigations/Investigation-2.raw windows.cmdline --pid 1940
vol -f /Scenarios/Investigations/Investigation-2.raw windows.cmdline --pid 740
```
`ctfmon.exe` запущен из правильной директории `C:\WINDOWS\system32\`. 
Далее подозрительные процессы `tasksche.exe` и его дочерний процесс `@WanaDecryptor@.exe`. Родитель запущен из `C:\Intel\ivecuqmanpnirkt615\`, можно предположить, что `@WanaDecryptor@.exe` тоже, однако лучше найти подтверждение этому. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img18.png)

При помощи `windows.memmap` дампим виртуальную память процесса `taskshe.exe`.
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.memmap --pid 1940 --dump
strings pid.1940.dmp >> 1940str
```
В получившемся файле очень много строк, поэтому читать его полностью явно не самая эффективная идея. Погрепаем информацию, которая может быть полезна для дела.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img19.png)

Вытягиваем информацию по интересующему нас `@WanaDecryptor@.exe`:
```sh
cat 1940str | grep -i "wanadecrypt"
```
Отсюда видно, что интересующий нас файл запускается из той же директории `C:\Intel\ivecuqmanpnirkt615\`. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img20.png)

Найдем информацию, которая сохранилась о файловой системе, при помощи плагина `windows.filescan`, выполним поиск сразу по нужной директории `C:\Intel\ivecuqmanpnirkt615\`.
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.filescan | grep -i "Intel"
```
На самом деле, еще раньше можно было поискать информацию в интернете и понять, что мы имеем дело с вирусом `WannaCry`. Сейчас мы это лишь подтверждаем, собрав больше количество IOC в образе (`@WanaDecryptor@.exe`, `tasksche.exe`, сообщения для шантажа для различных языков, `*.wnry`, и т. д.).

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img21.png)

С помощью полученной информации отвечаем на часть вопросов.

What suspicious process is running at PID 740 in Case 002?
> @WanaDecryptor@

What is the full path of the suspicious binary in PID 740 in Case 002?
>C:\Intel\ivecuqmanpnirkt615\@WanaDecryptor@.exe

What is the parent process of PID 740 in Case 002?
>tasksche.exe

What is the suspicious parent process PID connected to the decryptor in Case 002?
>1940

From our current information, what malware is present on the system in Case 002?
>Wannacry

Далее вопрос про dll. В первом кейсе я уже описывала нестандартные для файла `reader_sl.exe` библиотеки предназначенные для работы Windows Socket: `WS2_32.dll` и `WS2HELP.dll`. Выведем библиотеки для `@WanaDecryptor@.exe`:
```sh
vol -f /Scenarios/Investigations/Investigation-2.raw windows.dlllist --pid 740
```
В него аналогично подгружены эти библиотеки.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img22.png)

What DLL is loaded by the decryptor used for socket creation in Case 002?
>WS2_32.dll

Wannacry работает с определенным мьютексом, который является индикатором, запущен ли уже на этом хосте вирус (защита от данного вируса в тч строится на том, что заранее создается нужный мьютекс). 
```sh
cat 1940str | grep -i "Mutex"
```
В первую очередь `tasksche.exe` пробует создать а потом открыть мьютексы Global\MsWinZonesCacheCounterMutexA\W, после этого, видимо, если мьютекс уже существует, он пробует просто открыть его. После этого видны повторения, возможно для страховки, разных функций или потоков.
Также ниже есть работа с легитимными мьютексами системы Windows (RPC).

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Volatility/img/img23.png)

What mutex can be found that is a known indicator of the malware in question in Case 002?
> MsWinZonesCacheCounterMutexA

Ранее я уже использовала этот плагин: `windows.filescan`
What plugin could be used to identify all files loaded from the malware working directory in Case 002?
> windows.filescan