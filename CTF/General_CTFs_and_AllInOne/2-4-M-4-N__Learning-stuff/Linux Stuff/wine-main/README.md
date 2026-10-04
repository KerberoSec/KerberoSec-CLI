__Source:__ [here]( https://youtu.be/nFbpXN7wvCs?si=6rAerQevX-i1Z-MI)

## What is wine?
Wine is a free and open-source compatibility layer that allows you to run Windows applications on Linux

## How to setup wine and run?

- __Open Terminal on kali linux:__ ```sudo dpkg --add-architecture i386```

- __After adding architecture on kali linux:__ ```sudo apt update && sudo apt upgrade -y && sudo apt full-upgrade -y```

- __Now install wine on kali linux:__ ```sudo apt install wine wine64 wine32 winbind winetricks -y```

- __Install .exe extension file using wine:__ ```wine target_file.exe```

