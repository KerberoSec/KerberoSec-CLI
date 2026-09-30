```
▌ ▌   ▌   ▞▀▖▐  ▐        ▌   ▛▀▘              ▗            ▛▀▖             ▞▀▖▜          
▌▖▌▞▀▖▛▀▖ ▙▄▌▜▀ ▜▀ ▝▀▖▞▀▖▌▗▘ ▙▄▞▀▖▙▀▖▞▀▖▛▀▖▞▀▘▄ ▞▀▖▞▀▘ ▄▄▖ ▌ ▌▙▀▖▞▀▖▛▀▖▞▀▖ ▙▄▌▐ ▞▀▖▛▀▖▞▀▖
▙▚▌▛▀ ▌ ▌ ▌ ▌▐ ▖▐ ▖▞▀▌▌ ▖▛▚  ▌ ▌ ▌▌  ▛▀ ▌ ▌▝▀▖▐ ▌ ▖▝▀▖     ▌ ▌▌  ▌ ▌▌ ▌▛▀  ▌ ▌▐ ▌ ▌▌ ▌▛▀ 
▘ ▘▝▀▘▀▀  ▘ ▘ ▀  ▀ ▝▀▘▝▀ ▘ ▘ ▘ ▝▀ ▘  ▝▀▘▘ ▘▀▀ ▀▘▝▀ ▀▀      ▀▀ ▘  ▝▀ ▘ ▘▝▀▘ ▘ ▘ ▘▝▀ ▘ ▘▝▀▘
```
In this THM room, we explore web attack forensics using Splunk to pivot between web logs
and host-level telemetry. [^1]

What is the reconnaissance executable file name?
-----------------------------------------------------------------------------------------
This task requires us to log in to the Splunk dashboard under the following URL without
any credentials:<br> `http://<TARGET_MACHINE_IP>:8000/en-US/app/search/search/`<br>
Note, that we may have to wait a few minutes for the target machine to boot up. In the
search panel we first set the time range to all time as results may otherwise be too
narrow. Then, we want to search for web access logs in HTTP requests that include any
sign of command execution attempts, such as `cmd.exe` or `PowerShell` to help identify
a possible command injection: `index=windows_apache_access (cmd.exe OR powershell OR
"powershell.exe" OR "Invoke-Expression") | table _time host clientip uri_path uri_query
status`

With this search query we were able to identify the vulnerable CGI script `hello.bat`
that the attacker uses to execute system commands on the web app server. In the URI query
we also spot a base64-encoded PowerShell string that can be decoded with `base64 -d` and
so `VABoAGkAcwAgAGkAcwAgAG4AbwB3ACAATQBpAG4AZQAhACAATQBVAEEASABBAEEASABBAEEA` equals
to the text "This is now Mine! MUAHAAHAA". After having looked at web commands, we now
want to look for server-side error logs, as this could help to uncover malicious activity
`index=windows_apache_error ("cmd.exe" OR "powershell" OR "Internal Server Error")`.
And indeed, there are three Apache error logs showing signs of execution attempts,
confirming that the attacker's input was processed by the server but failed during the
execution due to some web layer blocking.
To confirm the attacker's enumeration activity, we can aim to discover commands that are
usually used during the post-exploitation reconnaissance phase, such as `whoami`. The
query to find those command execution logs is `index=windows_sysmon *cmd.exe* *whoami*`
and indeed, we can find the Apache24 CGI command `whoami.exe` listed in the events.

What executable was attempted to run through the command injection?
-----------------------------------------------------------------------------------------
Next, we can also trace malicious executable files that the web server might have spawned
with the following Splunk query `index=windows_sysmon ParentImage="*httpd.exe"`. This
result shows system processes like the `powershell.exe` which indicates a successful
command injection where Apache executed a system command instead of only spawning worker
threads as usually.

Finally, to check if the PowerShell command was successfully executed and the encoded
payload delivered, we run the query `index=windows_sysmon Image="*powershell.exe"
(CommandLine="*enc*" OR CommandLine="*-EncodedCommand*" OR CommandLine="*Base64*")` and
since the web application server defences were correctly configured, we get no results.

[^1]: https://tryhackme.com/room/webattackforensics-aoc2025-b4t7c1d5f8
