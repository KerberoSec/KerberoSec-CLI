# [0x02] Introducion to KAPE
KAPE (Kroll's Artifact Parser and Extractor): инструмент, работающий прежде всего с клонами/образами жёсткого диска. У KAPE есть два основных режима работы: сбор данных (т.н. acquisition) и их анализ. 
Также есть два формата взаимодействия с KAPE: через CLI (при скачивание файл: `kape.exe`) и через GUI (`gkape.exe`). 

From amongst kape.exe and gkape.exe, which binary is used to run GUI version of KAPE?
> gkape.exe

# [0x03] Target Options
KAPE не умеет принимать на вход образы дисков. Поэтому сначала необходимо смонтировать образ в виде логического диска и на вход **Target source** подать путь к логическому диску. В **Target destination** указываем папку, куда будут извлечены данные для анализа. 
Target определяются в KAPE как файлы с расширением `.tkape`. Файл `.tkape` содержит информацию об артефакте, который мы хотим собрать, например, о пути, категории и файловых масках для сбора.

What is the file extension for KAPE `Targets`?
> .tkape

KAPE также поддерживает Compound Targets. Это таргеты, которые являются соединениями множества других таргетов. 

What type of `Target` will we use if we want to collect multiple artifacts with a single command?
> Compound Targets

# [0x04] Module Options
То, какие именно данные будут извлечены, выбирается из длинного списка плагинов. на вход **Module source** указываем папку с содержимым из первого этапа (либо оно подтягивается автоматом в GUI) и в **Module destination** указываем, куда сохранить результаты анализа файлов. Содержимое плагинов можно просматривать точно так же, как и на первом этапе. 
Модули имеют расширение `.mkape` в KAPE

What is the file extension of the `Modules` files?
> .mkape

Также в KAPE предусмотрена директория `bin`, в которой содержатся исполняемые файлы, которые мы хотим запустить на системе, но они не являются встроенными. KAPE будет запускать исполняемые файлы либо из каталога `bin`, либо из их полного пути.

What is the name of the directory where binary files are stored, which may not be present on a typical system, but are required for a particular KAPE Module?
> bin

# [0x05] KAPE GUI
В кейсе при настройке таргетов в гуи мы выбираем `kapetriage`.

In the second to last screenshot above, what target have we selected for collection?
>kapetriage

При настройке модулей в гуи мы выбираем `!EZParser`.

In the second to last screenshot above, what module have we selected for processing?
> !EZParser

Чекбокс `Add %d` в гуи добавляет информацию о дате к названию каталога, где собранные данные сохраняются. Аналогичным образом, `Add %m` будет добавлять информацию о машине в каталог **Target destination**. 

What option has to be checked to append date and time information to triage folder name?
>%d

What option needs to be checked to add machine information to the triage folder name?
>%m

# [0x06] KAPE CLI
Все вопросы из данного раздела решаются командой `kape.exe`, шде описано как ее использовать.
```sh
D:\KAPE>kape.exe

KAPE version 1.1.0.1 Author: Eric Zimmerman (kape@kroll.com)

	tsource         Target source drive to copy files from (C, D:, or F:\ for example)
	target          Target configuration to use
	tdest           Destination directory to copy files to. If --vhdx, --vhd or --zip is set, files will end up in VHD(X) container or zip file
	tlist           List available Targets. Use . for Targets directory or name of subdirectory under Targets.
	tdetail         Dump Target file details
	tflush          Delete all files in 'tdest' prior to collection
	tvars           Provide a list of key:value pairs to be used for variable replacement in Targets. Ex: --tvars user:eric would allow for using %user% in a Target which is replaced with eric at runtime. Multiple pairs should be separated by ^
	tdd             Deduplicate files from --tsource (and VSCs, if enabled) based on SHA-1. First file found wins. Default is TRUE

	msource         Directory containing files to process. If using Targets and this is left blank, it will be set to --tdest automatically
	module          Module configuration to use
	mdest           Destination directory to save output to
	mlist           List available Modules. Use . for Modules directory or name of subdirectory under Modules.
	mdetail         Dump Module processors details
	mflush          Delete all files in 'mdest' prior to running Modules
	mvars           Provide a list of key:value pairs to be used for variable replacement in Modules. Ex: --mvars foo:bar would allow for using %foo% in a module which is replaced with bar at runtime. Multiple pairs should be separated by ^
	mef             Export format (csv, html, json, etc.). Overrides what is in Module config

	sim             Do not actually copy files to --tdest. Default is FALSE
	vss             Process all Volume Shadow Copies that exist on --tsource. Default is FALSE

	vhdx            The base name of the VHDX file to create from --tdest. This should be an identifier, NOT a filename. Use this or --vhd or --zip
	vhd             The base name of the VHD file to create from --tdest. This should be an identifier, NOT a filename. Use this or --vhdx or --zip
	zip             The base name of the ZIP file to create from --tdest. This should be an identifier, NOT a filename. Use this or --vhdx or --vhd

	scs             SFTP server host/IP for transferring *compressed VHD(X)* container
	scp             SFTP server port. Default is 22
	scu             SFTP server username. Required when using --scs
	scpw            SFTP server password
	scd             SFTP default directory to upload to. Will be created if it does not exist
	scc             Comment to include with transfer. Useful to include where a transfer came from. Defaults to the name of the machine where KAPE is running

	s3p             S3 provider name. Example: spAmazonS3 or spGoogleStorage. See 'https://bit.ly/34s9nS6' for list of providers. Default is 'spAmazonS3'
	s3r             S3 region name. Example: us-west-1 or ap-southeast-2. See 'https://bit.ly/3aNxXhc' for list of regions by provider
	s3b             S3 bucket name
	s3k             S3 Access key
	s3s             S3 Access secret
	s3st            S3 Session token
	s3kp            S3 Key prefix. When set, this value is used as the beginning of the key. Example: 'US1012/KapeData'
	s3o             When using 'spOracle' provider, , set this to the 'Object Storage Namespace' to use
	s3c             Comment to include with transfer. Useful to include where a transfer came from. Defaults to the name of the machine where KAPE is running

	s3url           S3 Presigned URL. Must be a PUT request vs. a GET request

	asu             Azure Storage SAS Uri
	asc             Comment to include with transfer. Useful to include where a transfer came from. Defaults to the name of the machine where KAPE is running

	zv              If true, the VHD(X) container will be zipped after creation. Default is TRUE
	zm              If true, directories in --mdest will be zipped. Default is FALSE
	zpw             If set, use this password when creating zip files (--zv | --zm | --zip)

	hex             Path to file containing SHA-1 hashes to exclude. Only files with hashes not found will be copied

	debug           Show debug information during processing
	trace           Show trace information during processing

	gui             If true, KAPE will not close the window it executes in when run from gkape. Default is FALSE

	ul              When using _kape.cli, when true, KAPE will execute entries in _kape.cli one at a time vs. in parallel. Default is FALSE

	cu              When using _kape.cli, if true, KAPE will delete _kape.cli and both Target/Module directories upon exiting. Default is FALSE

	sftpc           Path to config file defining SFTP server parameters, including port, users, etc. See documentation for examples
	sftpu           When true, show passwords in KAPE switches for connection when using --sftpc. Default is TRUE

	rlc             If true, local copy of transferred files will NOT be deleted after upload. Default is FALSE
	guids           KAPE will generate 10 GUIDs and exit. Useful when creating new Targets/Modules. Default is FALSE
	sync            If true, KAPE will download the latest Targets and Modules from specified URL prior to running. Default is https://github.com/EricZimmerman/KapeFiles/archive/master.zip

	ifw             If false, KAPE will warn if a process related to FTK is found, then exit. Set to true to ignore this warning and attempt to proceed. Default is FALSE

	Variables: %d = Timestamp (yyyyMMddTHHmmss)
			   %s = System drive letter
			   %m = Machine name

Examples: kape.exe --tsource L: --target RegistryHives --tdest "c:\temp\RegistryOnly"
	  kape.exe --tsource H --target EvidenceOfExecution --tdest "c:\temp\default" --debug
	  kape.exe --tsource \\server\directory\subdir --target Windows --tdest "c:\temp\default_%d" --vhdx LocalHost
	  kape.exe --msource "c:\temp\default" --module LECmd --mdest "c:\temp\modulesOut" --trace --debug

	  Short options (single letter) are prefixed with a single dash. Long commands are prefixed with two dashes

	  Full documentation: https://ericzimmerman.github.io/KapeDocs/

D:\KAPE>
        
```

Run the command `kape.exe` in an elevated shell. Take a look at the different switches and variables. What variable adds the collection timestamp to the target destination?
> %d

What variable adds the machine information to the target destination?
> %m

Which switch can be used to show debug information during processing?
> debug

Which switch is used to list all targets available?
> tlist

Which flag, when used with batch mode, will delete the \_kape.cli, targets and modules files after the execution is complete?
>cu
# [0x07] Hands-on Challenge
Scenarion:
Organization X has an Acceptable Use Policy for their Portable Devices, including Laptops. This policy forbids users from connecting removable or Network drives, installing software from unknown locations, and connecting to unknown networks. It looks like one of the users has violated this policy. Can you help Organization X find out if the user violated the Acceptable Use Policy on their device? The user's machine is attached to the room as a .

Navigate to the KAPE directory placed on the Desktop in the attached VM. Run KAPE with your desired Target and Module options, and answer the following questions.

**Hint:** You can use EZviewer placed in the EZtools folder on Desktop to open CSV files.

В начале необходимо запустить KAPE на сбор данных и их анализ. На рабочем столе создаю соответствующие директории target и module, пути до них указываю как destination в GUI KAPE. В качестве target source, тк мы работаем на локальной машине, указываю `C:\`.
Аналогично добавляю targets: KapeTriage, как в прошлых кейсах, и module: !EzParser. Выполняем получившуюся команду:
```powershell
.\kape.exe --tsource C: --tdest C:\Users\THM-4n6\Desktop\target --tflush --target KapeTriage --mdest C:\Users\THM-4n6\Desktop\module --mflush --module !EzParser --gui
```

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img1.png)

Ожидаем выполнение. И смотрим в собранные таргеты. Там у нас лежит собранная информация о диске и логи. Дальше я решила пойти по пути решения из кейсов по Windows Forensics, тк надпись в начале кейса про это сбила меня с толку (на данном этапе я не полезла даже в папку с обработанной модулями информацией).
Первый вопрос у нас про UDB Mass Storage, поэтому по пути `c:\Windows\System32\config\` достаем куст SYSTEM + LOG файлы к нему. Подгружаем их и изучаем. В ветке ControlSet001\Enum\USBSTOR\ лежат искомые значения ключей: два USB Device с серийными номерами 0123456789ABCDE и 1C6F654E59A3B0C179D366AE&0 соответственно. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img2.png)

Two USB Mass Storage devices were attached to this Lab Machine. One had a Serial Number  0123456789ABCDE. What is the Serial Number of the other USB Device?
> 1C6F654E59A3B0C179D366AE&0

Некст вопрос про установку программ с некоего сетевого диска. Для этого я перешла в куст SOFTWARE и полезла в UserAssist, чтобы узнать сколько раз запускались те или иные программы. На скриншоте ниже представлено два uid, в которых есть значения.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img3.png)

В первом же по поиску находим нужные значения: 7z;

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img4.png)

firefox;

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img5.png)

chrome. Здесь же можно найти время исполнения файла.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img6.png)
7zip, Google Chrome and Mozilla Firefox were installed from a Network drive location on the Lab Machine. What was the drive letter and path of the directory from where these software were installed?
> Z:\Setups

What is the execution date and time of CHROMESETUP.EXE in MM/DD/YYYY HH:MM?
> 11/25/2021 03:33

К следующему вопросу у меня не было идей как подступиться, поэтому пыталась найти информацию в ветках по типу Run и Runonce. Но там ничего полезного не было.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img7.png)

Воспользовавшись чудесами поисковой строки можно найти информацию про WordWheelQuery: это раздел в реестре Windows (`NTUSER.DAT`), который сохраняет историю поисковых запросов в Проводнике. В реестре находится: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\WordWheelQuery`. С помощью него можно узнать, какие файлы, папки или ключевые слова искал пользователь. Достаем ntuser.dat пользователя THM-4n6, переходим туда и видим искомый запрос.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img8.png)

What search query was run on the system?
> RunWallpaperSetup.cmd

Следующий вопрос про сети, возвращаемся в куст реестра SOFTWARE. `SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkList\Signatures\Unmanaged` содержит информацию о сетях, в том числе об искомой Network3. 

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img9.png)

Далее я перешла к той же подсети в Profiles. Однако я не разобралась как преобразовать из RedBinary в дату. И тут пришло осознание, что я зачем-то решаю через регистры, когда у меня уже есть распаршенная при помощи KAPE информация.
Захожу в каталог Module и ищу всю все файлы связанные с network, есть файл KnownNetwork, в котором как раз-таки лежит нужная распаршенная инфомация.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img10.png)

When was the network named Network 3 First connected to?
> 11/30/2021 15:44

Снова вопрос про съемный носитель. Теперь уже ответим на вопрос при помощи информации, данной нам KAPE. FileFolderAccess содержит артефакты доступа к файлам и папкам. Ищем там вхождение по `kape`, находим нужный диск.

![Image alt](https://github.com/duckinlake/PickMe-DFIRing/blob/main/KAPE/img/img11.png)

KAPE was copied from a removable drive. Can you find out what was the drive letter of the drive where KAPE was copied from?
> E: