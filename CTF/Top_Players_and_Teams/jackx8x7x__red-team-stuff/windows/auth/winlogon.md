# Winlogon
## Interactive Logon Model
Winlogon, the GINA, and network providers are the parts of the interactive logon model.

Winlogon provides a set of support functions for the GINA DLL

## GINA
### Overview
A Graphical Identification and Authentication dynamic-link library (DLL) loaded by the `winlogon` process.

The purpose of a GINA DLL is to provide customizable user identification and authentication procedures.

### SAS
The GINA operates in the *context of the Winlogon process* and, as such, the GINA DLL is loaded *very early* in the boot process.

The default GINA does this by delegating SAS event monitoring to Winlogon, which receives and processes `CTL+ALT+DEL` secure attention sequences (SASs).

Winlogon will evaluate its state to determine what is required to process the custom GINA's SAS. This processing usually includes calls to the GINA's SAS processing functions.

https://learn.microsoft.com/en-us/windows/win32/secauthn/gina  

### Interactions with Winlogon
https://learn.microsoft.com/en-us/windows/win32/secauthn/interaction-between-winlogon-and-gina  

### Winlogon Support Functions
https://learn.microsoft.com/en-us/windows/win32/secauthn/authentication-functions  

## Winlogon States
Winlogon maintains the workstation state that is used by the GINA to determine what authentication actions are required.

https://learn.microsoft.com/en-us/windows/win32/secauthn/winlogon-states

## Desktops
When Winlogon initializes, it registers the `CTRL+ALT+DEL` secure attention sequence (SAS) with the system, and then creates three desktops within the WinSta0 window station.

### Winlogon Desktop
This is the desktop that Winlogon and GINA use for interactive identification and authentication, and other secure dialog boxes.

### Application Desktop

### Screen Saver Desktop