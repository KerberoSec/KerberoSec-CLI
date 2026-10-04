# [0x02] The FAT file system
How many addressable bits are there in the FAT32 file system?
> 28 bits

What is the maximum file size supported by the FAT32 file system? (In GB)
> 4

Which file system is used by digital cameras and SD cards?
> exFAT

# [0x03] The NFTS file system
При помощи `MFTECmd.exe` парсим MFT из дампа. 
```powershell
.\MFTECmd.exe -f C:\Users\THM-4n6\Desktop\triage\C\$MFT --csv <patH>
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img1.png)

Открываем файл при помощи EZViewer или просто в блокноте. Там уже находим параметр размера для соответствующего файла

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img2.png)

Parse the $MFT file placed in `C:\users\THM-4n6\Desktop\triage\C\` and analyze it. What is the Size of the file located at `.\Windows\Security\logs\SceSetupLog.etl`
> 49152

Далее парсим загрузочный сектор `$Boot`. Он лежит в той же директории, что и `$MFT`. Cluster size: 4096.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img3.png)

What is the size of the cluster for the volume from which this triage was taken?
> 4096

# [0x04]  Recovering deleted files
В Autopsy открываем дамп флешки. Изучаем какие файлы там есть, хранится три удаленных файлов, помеченных крестиков. Одним из них является TryHackme.xlsx, вторым TryHackMe2.txt.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img4.png)

There is another xlsx file that was deleted. What is the full name of that file?
> TryHackme.xlsx

What is the name of the TXT file that was deleted from the disk?
> TryHackMe2.txt

Далее либо экспортируем текстовый файл на машину, либо просто смотрим преобразованные хексы файла в autopsy.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img5.png)

Recover the TXT file from Question #2. What was written in this txt file?
> THM-4n6-2-4

# [0x05] Evidence of execution

Начнем с изучения Prefetch Files. Используем `PECmd.exe`:

```powershell
.\PECmd.exe -d C:\Windows\Prefetch --csv <path> 
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img6.png)

Далее открываем файл, в моем случае использую EZViewer, там ищем по названию файла: gkape.exe.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img7.png)

В столбце, указывающего на количество запусков видим искомое число.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img8.png)

How many times was gkape.exe executed?
> 2

В этом же файле в той же строке находим последнее время подключение.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img9.png)

What is the last execution time of gkape.exe

> 12/01/2021 13:04

Далее изучим недавно используемые файлы и приложения в Windows 10 Timeline при помощи `WxTCmd`:
```powershell
WxTCmd.exe -f C:\Users\THM-4n6\Desktop\triage\C\Users\THM-4n6\AppData\Local\ConnectedDevicesPlatform\{randomfolder}\ActivitiesCache.db --csv <path-to-save-csv>
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img10.png)

Открываю при помощи EZViewer. Ищем Notepad и далее время, которое он был открыт.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img11.png)

When Notepad.exe was opened on 11/30/2021 at 10:56, how long did it remain in focus?
> 00:00:41

Используем утилиту для просмотра списков прыжков JLECmd.exe:
```powershell
JLECmd.exe -f C:\Users\THM-4n6\Desktop\triage\C\Users\THM-4n6\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations --csv <path>
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img12.png)

Jumplists включают информацию о выполненных заявках, первом времени исполнения и последнем случае выполнения заявки против AppID. Открываю файл через EZViewer, ищу Changelog.txt, там уже находим файл, при помощи которого открывался текстовый.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img13.png)

What program was used to open C:\Users\THM-4n6\Desktop\KAPE\KAPE\ChangeLog.txt?
>notepad.exe

# [0x06] File/folder knowledge

Возвращаемся к файлу с распаршенным Windows 10 Timeline. Там ищем regripper и LastModified. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img14.png)

When was the folder C:\Users\THM-4n6\Desktop\regripper last opened?
> 12/1/2021 13:01

В этом же файле смотрим время создания.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics2/img/img15.png)

When was the above-mentioned folder first opened?
> 12/1/2021 12:31

# [0x07] External Devices/USB device forensics
Which artifact will tell us the first and last connection times of a removable drive?
> Setupapi.dev.log