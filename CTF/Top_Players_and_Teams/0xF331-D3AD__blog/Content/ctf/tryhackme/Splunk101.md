
# Splunk 101

## *Splunk Apps*

- What is the 'Folder name' for the add-on?

![addon-name](https://i.postimg.cc/mrXVgx3j/addon-dir.png)

> TA-microsoft-sysmon

- What is the Version?

> 10.6.2

---

## *Adding Data*

- Upload the Splunk tutorial data on the desktop. How many events are in this source?

> 109,864

---

## *Splunk Queries*

Use Splunk to search for the phraze 'failed password'.

- What is the source type?

![failed-password-source-type](https://i.postimg.cc/qv75SmMH/failed-password-source-type.png)

> www1/secure

In the search result, look at the Patterns tab.

- What is the last username int this tab ?

![failed-password-patterns](https://i.postimg.cc/Zq0KYt4b/failed-password-patterns.png)

> myuan

- Search for failed password events for this specific username. How many events are returned?

![failed-password-myuan](https://i.postimg.cc/7667yQQ0/failed-password-myuan.png)

> 16

---

## *Sigma Rules*

![uncoder](https://i.postimg.cc/c422Pp6y/uncoder.png)

- Use the Select document feature. What is the Splunk query for 'sigma: APT29'?

> source="WinEventLog:*" AND CommandLine="*-noni -ep bypass $*"

- Use the Github Sigma repo. What is the Splunk query for 'CACTUSTORCH Remote Thread Creation'?

![Sysmon-cactustorch](https://i.postimg.cc/kX81K5FV/sysmon-cactustorch.png)

![Sysmon-cactustorch-converted](https://i.postimg.cc/L5hbPB4L/sysmon-cactustorch-converted.png)

> source="WinEventLog:*" AND ((SourceImage="*\\System32\\cscript.exe" OR SourceImage="*\\System32\\wscript.exe" OR SourceImage="*\\System32\\mshta.exe" OR SourceImage="*\\winword.exe" OR SourceImage="*\\excel.exe") AND TargetImage="*\\SysWOW64\\*" AND NOT StartModule="*")

---

## *Dashboards & Visualizations*

- What is the highest EventID?

> 

