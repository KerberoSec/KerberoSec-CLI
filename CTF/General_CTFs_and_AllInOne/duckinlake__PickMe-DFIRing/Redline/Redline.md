# [0x02] Data collection
What data collection method takes the least amount of time?
> Standard Collector

You are reading a research paper on a new strain of ransomware. You want to run the data collection on your computer based on the patterns provided, such as domains, hashes, IP addresses, filenames, etc. What method would you choose to run a granular data collection against the known indicators?
> IOC Search Collector

What script would you run to initiate the data collection process? Please include the file extension.
> RunRedlineAudit.bat

If you want to collect the data on Disks and Volumes, under which option can you find it?
> Disk Enumeration

What is the default filename you receive as a result of your Redline scan?
 > AnalysisSession1.mans
 
# [0x03] The Redline Interface
Where in the Redline UI can you view information about the Logged in User?
> System Information

# [0x04] Standart Collector Analysis
Для начала узнаем базовую информацию о системе,  ОС машины и другая информация находится в левой панели `Analysis Data` во вкладке `System Information`. Также там написано про BIOS (for Windows) и пользовательская инфа.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img1.png)

В блоке Operating System Information хранится **Operating System**: `Windows Server 2019 Standart 17763` и **Product Name**: `Windows Server 2019 Standart`. Также во вкладке есть имя хоста `THM-REDLINE`, аппаратные ресурсы машины и время, когда собиралась информация.
Provide the Operating System detected for the workstation.
>Windows Server 2019 Standard 17763

Задачи находятся во вкладке Tasks. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img2.png)

Подозрительную запланированную задачу я определяла по тому, кто создал задачу, также в данном случае был странный комментарий и название. 
Name: `MSOfficeUpdateFa.ke`
Comment: `THM-p3R5lSteNCe-m3Chani$m`
Creator: `THM-REDLINE\Administrator`

What is the suspicious scheduled task that got created on the computer?
> MSOfficeUpdateFa.ke

Find the message that the intruder left for you in the task.
> THM-p3R5lSteNCe-m3Chani$m

Открываем Event Logs, там фильтруем по источнику: THM-Redline-User и по типу: ошибка.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img3.png)

На скриншоте видно, что после фильтрации остается только одно событие с Event ID (EID) 546, от того же пользователя `THM-REDLINE\Administrator`. Там же есть сообщение
There is a new System Event ID created by an intruder with the source name "THM-Redline-User" and the Type "ERROR". Find the Event ID #.
> 546

Provide the message for the Event ID.
>Someone cracked my password. Now I need to rename my puppy-++-

Обращаемся к истории загрузок.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img4.png)

В истории загрузок видно легитимные Mozilla Firefox, CyberChef, приложение с Fireeye, приложение с Miscrosoft, а также подозрительные загрузки: file.io (что-то типа dropmefiles), скачивание King Phisher, Termineter и Sniper Phisher с github: тулзы для фишинга и тестирования безопасности. Также был скачен файл `flag.txt` с wormhole.app (тоже сайт для того, чтобы делиться файлами)

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img5.png)

Открываем файл по пути загрузки: `C:\Program Files (x86)\Windows Mail\SomeMailFolder\flag.txt` и читаем его
It looks like the intruder downloaded a file containing the flag for Question 8. Provide the full URL of the website.
> https://wormhole.app/download-stream/gI9vQtChjyYAmZ8Ody0AuA

Provide the full path to where the file was downloaded to including the filename.
> C:\Program Files (x86)\Windows Mail\SomeMailFolder\flag.txt

Provide the message the intruder left for you in the file.
>THM{600D-C@7cH-My-FR1EnD}

# [0x05] IOC Search Collector
Для выполнения кейса не требуется создавать IOC или выполнять сканирования: вся информация для ответа на вопросы явно указана на скринах. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img6.png)

На скрине обведены полный путь до файла (`C:\Users\charles\Desktop\THM1768.exe`), размер, владелец (`WIN-2DET5DP0NPT\charles`), а также правило по которому IOC был найден: строки содержат `psylog.exe` (истинное название файла) или содержат  `RIDEV_INPUTSINK`, md5sum `791ca706b285b9ae3192a33128e4ecbb` и размер `35400`.
What is the actual filename of the Keylogger?
>psylog.exe

What filename is the file masquerading as?
>THM1768.exe

Who is the owner of the file?
>WIN-2DET5DP0NPT\charles

What is the file size in bytes?
>35400

Также в репорте есть скриншот, где видно пути до выявленных файлов и в тч до файла `.ioc`

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img7.png)

Provide the full path of where the .ioc file was placed after the Redline analysis, include the .ioc filename as well
>C:\Users\charles\Desktop\Keylogger-IOCSearch\IOCs\keylogger.ioc

# [0x06] IOC Search Collector Analysis
В начале создаем через IOCeditor IOC для pass-the-hash attack, используя артефакты приведенные в кейсе: (File Strings: 20210513173819Z0w0= or \<?<L<T<g= ) and (File Size (Bytes): 834936)

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img8.png)

Сохраняем.
Открываем Redline Session: `C:\Users\Administrator\Documents\Analysis\Sessions\AnalysisSession1`. После этого переходим во вкладку IOC Reports и создаем новый отчет (`Create a New IOC Report`), там подгружаем папку, где находится сохраненный `.ioc` и выбираем созданный шаблон.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img9.png)

После анализа, появится IOC Report и там будет репорт на искомую атаку, открываем через `View Hits +`

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img10.png)

 Там будет срабатывание, через `i` открываем подробную информацию.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img11.png)

Здесь есть уже вся нужная информация.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img12.png)

**Full Path**: C:\Users\Administrator\AppData\Local\Temp\8eJv8w2id6IqN85dfC.exe
**Device Path**: \Device\HarddiskVolume2
**Size** (который в том числе вызвал срабатывание): 834936
**md5**:
**Owner**: BUILTIN\Administrators
**PE Type**: Executable
**Subsystem**: Windows_CUI

Provide the path of the file that matched all the artifacts along with the filename.
>C:\Users\Administrator\AppData\Local\Temp\8eJv8w2id6IqN85dfC.exe

Provide the path where the file is located without including the filename.
>C:\Users\Administrator\AppData\Local\Temp\

Who is the owner of the file?
>BUILTIN\Administrators

Provide the subsystem for the file.
>Windows_CUI

Provide the Device Path where the file is located.
>\Device\HarddiskVolume2

Поскольку Redline сохранил только md5sum, прогоняем его через VirusTotal.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img13.png)

Помимо информации о самом файле, отсюда можно взять значение SHA-256. Также там есть информация, что это тулза PsExec, по своей сути она не является вредоносной.

Provide the hash (SHA-256) for the file.
>57492d33b7c0755bb411b22d2dfdfdf088cbbfcd010e30dd8d425d5fe66adff4

The attacker managed to masquerade the real filename. Can you find it having the hash in your arsenal?
>PsExec.exe

# [0x07] Endpoint Investigation
Первым делом собираем базовую информацию о системе.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img14.png)

**Machine Name**: WIN-2DET5DP0NPT, **Operating System**: Windows 7 Home Basic 7601 Service Pack 1, а также аппаратные ресурсы

Can you identify the product name of the machine?
>Windows 7 Home Basic

Далее изучим файловую систему, сначала рабочий стол.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img15.png)

Из интересующего там есть подозрительный файл `Endermanch@Cerber5.bin\Endermanch@Cerber5.exe`. Если прогнать md5sum через VirusTotal, то можно узнать, что это троян Cerber. Далее эта информация понадобится в ответах на вопросы.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img16.png)

Также на рабочем столе лежит сообщение-txtшник `_R_E_A_D___T_H_I_S___AJYG1O_.txt`.

Can you find the name of the note left on the Desktop for the "Charles"?
>\_R_E_A_D___T_H_I_S___AJYG1O_.txt

Далее переходим во вкладку Windows Services, там ищем Windows Defender, он будет выделен. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img17.png)

Открываем детали, по md5sum сервис легитимный, Service DLL: `C:\Program FIles\Windows Defender\MpSvc.dll`.

Find the Windows Defender service; what is the name of its service DLL?
>MpSvc.dll

Далее изучим файлы в загрузках. Поскольку вопрос про архив, посмотрим на них.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img18.png)

`sdl-redline.zip` - установочный пакет утилиты Mandiant Redline по хэш-сумме легитимный. Второй архив через

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img19.png)

Если прогнать файл, который там внутри был (по всей видимости это файл explorer.exe.exe), то это будет вредонос.

The user manually downloaded a zip file from the web. Can you find the filename?
>eb5489216d4361f9e3650e6a6332f7ee21b0bc9f3f3a4018c69733949be1d481.zip

Также проверим все файлы в загрузках, там есть несколько "чистых" файлов, но также ВПО.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img20.png)

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img21.png)

Если проверить все файлы, то картина будет такая.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/Redline/img/img22.png)

(по VirusTotal зеленые: легитимные, красные: ВПО, синее: архив, который сам по себе по хэшу не ищется, но хэш в название при этом ВПО)

Ответ на последние три вопроса был найден ранее при изучении файлов на рабочем столе.

Provide the filename of the malicious executable that got dropped on the user's Desktop.
>Endermanch@Cerber5.exe

Provide the MD5 hash for the dropped malicious executable.
>fe1bc60a95b2c2d77cd5d232296a7fa4

What is the name of the ransomware?
>Cerber