## Sequel HackTheBox
#### About the Box
Box is about sql. No, not sqli. you have to get into the sql server and use sql queires to get the flag.
**`Skill you will need:`**
- MySQL
- mysqldump
- nmap

---
#### Step 1: `enumming the net`
At first I'll run nmap:
```bash
nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v
```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|3306/tcp|open|mysql?|5.5.5-10.3.27-MariaDB-0+deb10u1|

Detail result:
```terminal
PORT     STATE SERVICE VERSION
3306/tcp open  mysql?
| mysql-info: 
|   Protocol: 10
|   Version: 5.5.5-10.3.27-MariaDB-0+deb10u1
|   Thread ID: 66
|   Capabilities flags: 63486
|   Some Capabilities: Support41Auth, SupportsLoadDataLocal, Speaks41ProtocolOld, SupportsCompression, IgnoreSigpipes, LongColumnFlag, SupportsTransactions, FoundRows, ODBCClient, Speaks41ProtocolNew, InteractiveClient, DontAllowDatabaseTableColumn, IgnoreSpaceBeforeParenthesis, ConnectWithDatabase, SupportsMultipleStatments, SupportsAuthPlugins, SupportsMultipleResults
|   Status: Autocommit
|   Salt: :-qslH_&>F'+DT[LJme7
|_  Auth Plugin Name: mysql_native_password

```

let's try to login as we can see mysql_native_password is here.

#### Step 2: `lemmi in`
To get in, we will use `mysql` command. The command is very simple:
```bash
mysql --host <ip> -u root
```
then you have to use regular query to examine mysql database. Or you can use `mysqldump` to automate the process.