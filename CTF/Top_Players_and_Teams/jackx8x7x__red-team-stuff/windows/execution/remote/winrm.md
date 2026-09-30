# WinRM

## Introduction

Windows Remote Management (WinRM) is the Microsoft implementation of the [WS-Management protocol](https://learn.microsoft.com/en-us/windows/win32/winrm/ws-management-protocol).

## Configuration

## CIM Cmdlet

Introduced in PowerShell ver 3.0.

### Older WMI Cmdlet

The older WMI cmdlets use the DCOM protocol, which is compatible with older versions of Windows but may be blocked by firewall on newer versions of Windows.

### Remote Management

The `Get-CimInstance` cmdlet uses the _**WSMan protocol**_ by default. Read [_Should I use CIM or WMI with Windows PowerShell?_](https://devblogs.microsoft.com/scripting/should-i-use-cim-or-wmi-with-windows-powershell/).

We can test whether the WinRM service is running on a local or remote computer with [Test-WSMan](https://learn.microsoft.com/en-us/powershell/module/microsoft.wsman.management/test-wsman?view=powershell-7.3).

```PowerShell
# The stack version can be determined using the `Test-WSMan` cmdlet. It needs to be version 3.0. to support WSMan
PS C:\> Test-WSMan -ComputerName dc01
```

Interactively get credential with `Get-Credential`

```PowerShell
$cred = Get-Credential
```

or use `System.Management.Automation.PSCredential`

```PowerShell
$passwd = ConvertTo-SecureString 'E3R$Q62^12p7PLlC%KWaxuaV' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ('svc_deploy', $p)
```

to query information from remote host.

```PowerShell
$CimSession = New-CimSession -ComputerName dc01 -Credential (Get-Credential)
Get-CimInstance -CimSession $CimSession -ClassName Win32_BIOS
```

## PowerShell Remoting

[Microsoft Learn: Enter-PSSession](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enter-pssession?view=powershell-7.3)
