# Burp Suite Certified Practitioner

Here I collect some tips and trick that found helpful during my preparation for 
the BSCP Cert.

It is meant as an addition to the official cheat sheets provided by Portswigger.

## SQL Injection

- [PortSwigger cheat sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
- [OWSAP testing guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection)

Dump table names via `UNION' (only one string column required)

| Database Engine   | Code                                 |
| ----------------- | ------------------------------------ |
| Oracle            | `SELECT table_name FROM all_tables` <br> `SELECT column_name FROM all_tab_columns WHERE table_name = 'TABLE-NAME-HERE'` |
| MS / PSQL / MySQL | `SELECT table_name FROM information_schema.tables` <br> `SELECT column_name FROM information_schema.columns WHERE table_name = 'TABLE-NAME-HERE'` |

