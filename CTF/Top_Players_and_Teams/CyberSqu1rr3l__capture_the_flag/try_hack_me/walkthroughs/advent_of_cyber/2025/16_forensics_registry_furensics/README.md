```
▛▀▘              ▗            ▛▀▖      ▗    ▐         ▛▀▘              ▗       
▙▄▞▀▖▙▀▖▞▀▖▛▀▖▞▀▘▄ ▞▀▖▞▀▘ ▄▄▖ ▙▄▘▞▀▖▞▀▌▄ ▞▀▘▜▀ ▙▀▖▌ ▌ ▙▄▌ ▌▙▀▖▞▀▖▛▀▖▞▀▘▄ ▞▀▖▞▀▘
▌ ▌ ▌▌  ▛▀ ▌ ▌▝▀▖▐ ▌ ▖▝▀▖     ▌▚ ▛▀ ▚▄▌▐ ▝▀▖▐ ▖▌  ▚▄▌ ▌ ▌ ▌▌  ▛▀ ▌ ▌▝▀▖▐ ▌ ▖▝▀▖
▘ ▝▀ ▘  ▝▀▘▘ ▘▀▀ ▀▘▝▀ ▀▀      ▘ ▘▝▀▘▗▄▘▀▘▀▀  ▀ ▘  ▗▄▘ ▘ ▝▀▘▘  ▝▀▘▘ ▘▀▀ ▀▘▝▀ ▀▀
```
In this THM room, we learn what the Windows Registry is and how to investigate it. [^1]

What application was installed on the `dispatch-srv01` before the abnormal activity
started?
-----------------------------------------------------------------------------------------
First, we open the Registry Editor from the Windows Administrative Tools where we are
given the different hives to investigate. In order, to see the programs run by a user, we
navigate to `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU`
which does not list any of interest here.

What is the full path where the user launched the application from?
-----------------------------------------------------------------------------------------

Which value was added by the application to maintain persistence on startup?
-----------------------------------------------------------------------------------------

[^1]: https://tryhackme.com/room/registry-forensics-aoc2025-h6k9j2l5p8
