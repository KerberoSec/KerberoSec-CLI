# HTB Academy: Linux Fundamentals: Task Scheduling

**Module:** [Task Scheduling](https://academy.hackthebox.com/app/module/18/section/2093)  
**Path:** Linux Fundamentals  
**Section:** System Management → Task Scheduling  
**Date Solved:** 2026-08-21  

---

## Challenge

Find the service type of `dconf.service`.

I first tried:

```bash
systemctl show dconf.service -p Type
```

But the result was empty:

```bash
Type=
```

So I searched for the service file directly:

```bash
locate dconf.service
```

This returned:

```bash
/usr/lib/systemd/user/dconf.service
```
I then checked the file:

```bash
cat /usr/lib/systemd/user/dconf.service
```

The service configuration showed:

```bash
[Service]
ExecStart=/usr/libexec/dconf-service
Type=dbus
BusName=ca.desrt.dconf
```
Result

The service type is:
```bash
dbus
```
What I Learned
systemctl show may not always return the expected value.
User-level systemd services can be stored under /usr/lib/systemd/user/.
If a command does not give enough information, checking the underlying service file directly can help.

*Write-up by [@emi-8](https://github.com/emi-8)*
