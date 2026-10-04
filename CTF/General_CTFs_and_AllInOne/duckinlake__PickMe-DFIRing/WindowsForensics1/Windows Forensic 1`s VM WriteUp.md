# [0x10] **The Challenge:**

**Scenario:**

One of the Desktops in the research lab at Organization X is suspected to have been accessed by someone unauthorized. Although they generally have only one user account per Desktop, there were multiple user accounts observed on this system. It is also suspected that the system was connected to some network drive, and a USB device was connected to the system. The triage data from the system was collected and placed on the attached VM. Can you help Organization X with finding answers to the below questions?

**Note:** When loading registry hives in RegistryExplorer, it will caution us that the hives are dirty. This is nothing to be afraid of. We just need to remember the little lesson about transaction logs and point RegistryExplorer to the .LOG1 and .LOG2 files with the same filename as the registry hive. It will automatically integrate the transaction logs and create a 'clean' hive. Once we tell RegistryExplorer where to save the clean hive, we can use that for our analysis and we won't need to load the dirty hives anymore. RegistryExplorer will guide you through this process.

В папке triage содержатся материалы, там можно увидеть дамп диска C:\, оттуда берем SAM файл по пути C:\Windows\System32\Config\SAM и открываем его через Registry Explorer by EZ.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img1.png)

Во вкладке с пользователями, SAM\Domains\Account\Users\ видим семь аккаунтов, четыре из них строенные (Administartor, Guest, DefaultAccount и WDAGUtilityAccount), а оставшиеся три созданные: THM-4n6 (под которым мы авторизованы), thm-user и thm-user2. 

How many user created accounts are present on the system?
> 3

Изучим значения, которые хранятся о пользователях.

| Значение                | Назначение                                                                         | Что можно извлечь                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `F`                     | Fixed data: запись фиксированной длины                                            | RID, время последнего входа, смены пароля, окончания срока действия УЗ, неудачной попытки входа, счётчики входов и неверных паролей, флаги состояния     |
| `V`                     | Variable data: запись переменной длины                                            | имя УЗ, полное имя, комментарий, путь к профилю, домашний каталог, logon script и другие строковые поля; там же находятся защищённые данные хешей пароля |
| `UserPasswordHint`      | Подсказка к паролю                                                                 | обычная строка UTF-16LE, не хеш и не пароль                                                                                                              |
| `ForcePasswordReset`    | Указывает системе на необходимость принудительной смены пароля при следующем входе |                                                                                                                                                          |
| `UserDontShowInLogonUI` | Отображение конкретной учетной записи на экране приветствия                        |                                                                                                                                                          |
и другие.

`F` содержит преимущественно изменяемое состояние УЗ. Наиболее важные поля:
- `Last Logon` - последний успешный локальный вход;
- `Password Last Set` - время последней установки/смены пароля;
- `Account Expires` - срок действия УЗ;
- `Last Bad Password` - последняя неверная попытка аутентификации;
- `Bad Password Count` - число неверных попыток;
- `Logon Count` - число входов;
- `RID`;
- `ACB flags` - битовые флаги состояния УЗ.

Распарсить всю эту информацию можно при помощи RegRipper. Закидываем туда SAM, указываем путь для репорта и запускаем утилиту.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img2.png)

Открываем отчет, там видим информацию про аккаунты. Изучив все, отмечаем, что у пользователя thm-user2 `Last Login Date : Never`. Следовательно он никогда не заходил в аккаунт.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img3.png)

What is the username of the account that has never been logged in?
> thm-user2

Переходим к следующему вопросу про пользователя THM-4n6. Смотрим ветку SAM\Domains\Account\Users\000003E9. Далее ищем значение UserPasswordHint и сразу можно увидеть преобразованное hex-значение `count`, которое и является подсказкой к паролю.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img4.png)

What's the password hint for the user THM-4n6?
>count

Все полезное из SAM в данном кейсе мы извлекли, далее работа с файлами. Переходим к  NTUSER.DAT, персональным настройкам реестра конкретного пользователя, я решила начать с THM-4n6, тут ищу последние открытые документы в ветке `\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs`. Тут находится искомая информация про `Changelog.txt`.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img5.png)

When was the file 'Changelog.txt' accessed?
> 2021-11-24 18:18:48

Продолжая копаться в NTUSER.DAT, мы можем получить информацию о количестве запусков через GUI, посмотрев ветку пользователя по его GUID: `NTUSER.DAT\Software\Microsoft\Windows\Currentversion\Explorer\UserAssist\{GUID}\Count`

В ветке пользователя с GUID \{CEBFF5CD-ACE2-4F4F-9178-9926F41749EA} есть запуски различных команд, фильтрую по количеству. Тут есть запуск инсталлятора python версии 3.8.2. Находится по пути: C:\Users\THM-4n6\Desktop\NTUSER.DAT_clean: SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\UserAssist\\{CEBFF5CD-ACE2-4F4F-9178-9926F41749EA}\Count

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img6.png)

What is the complete path from where the python 3.8.2 installer was run?
> Z:\setups\python-3.8.2.exe

Далее вопрос про USB. Информация про USB-устройства, подключенные к системе, хранится в  `SYSTEM\CurrentControlSet\Enum\USBSTOR` и `SYSTEM\CurrentControlSet\Enum\USB`. Перейдем во второе, там есть Disk ID и Serial Number устройств.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img7.png)

В  `SOFTWARE\Microsoft\Windows Portable Devices\Devices` хранятся Friendly Name устройств. Определить к какому устройству относится то или иное можно через GUID (Disk ID), которые мы определили раньше. Т.е. {E25192...110} имеет Friendly Name USB. Это устройство Kingston DataTraveler 2.0 USB Device.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img8.png)

Узнать время, когда последний раз подключали флэшку, можно в ветке `SYSTEM\CurrentControlSet\Enum\USBSTOR\Ven_Prod_Version\USBSerial#\Properties\{83da6326-97a6-4088-9453-a19231573b29}`. В нашем случае USBSerial# будет 1C6F65...&0. Переходим и в 0066 (что соответствует Last Time Connectes) хранится искомое время.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/WindowsForensics1/img/img9.png)

When was the USB device with the friendly name 'USB' last connected?
> 2021-11-24 18:40:06