бинарник является прошивкой роутера, есть два варианта развития событий: 1) реверс прошивки и вытаскивание файловой системы и дальнейший ее анализ ( например с помощью утилит binwalk или firmware-mod-kit).2) эмуляция роутера с помощью связки утилит firmadyne и qemu.
1) Реверс прошивки: 
 binwalk -e new_firmware.bin
 или 
 sudo /home/user/firmware-mod-kit/extract-firmware.sh  new_firmware.bin 
2) эмуляция с помощью qemu + firmadyne
/reset.sh
./sources/extractor/extractor.py -b vuln -sql 127.0.0.1 -np -nk "new_firmware.bin" images
./scripts/getArch.sh ./images/1.tar.gz
./scripts/tar2db.py -i 1 -f ./images/1.tar.gz
sudo ./scripts/makeImage.sh 1
./scripts/inferNetwork.sh 1
./scratch/1/run.sh

после получения доступа к файловой системе находим "лишний" скрипт в init.d (settings)
в этом скрипте находится ссылка на файл с "настройками" который и содержит флаг
