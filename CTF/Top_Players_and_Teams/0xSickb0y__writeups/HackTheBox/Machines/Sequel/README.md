# Sequel

> https://app.hackthebox.com/starting-point?tier=1

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/7ec56f19-2fef-44e1-ab50-1577efad5f3a" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [MySQL Access](#mysql-access)
* [Conclusion](#conclusion)

## About

This machine features a Linux system running a MySQL database server. The primary challenge involves gaining unauthorized access to the database using default credentials.

## References

* [MySQL Documentation](https://dev.mysql.com/doc/)
* [Default MySQL Credentials](https://dev.mysql.com/doc/refman/8.0/en/default-privileges.html)
* [MySQL Command Line Basics](https://dev.mysql.com/doc/refman/8.0/en/mysql-commands.html)
* [MySQL Security Best Practices](https://dev.mysql.com/doc/refman/8.0/en/security.html)

## Reconnaissance

Initial port scanning revealed TCP port 3306 running MySQL server version `5.5.5-10.3.27-MariaDB-0+deb10u1`

<img width="1900" height="425" alt="0" src="https://github.com/user-attachments/assets/da03ef6e-37e2-467f-a82b-c1e2fcdd2c07" />

## MySQL Access

From the MySQL Documentation: _"Installation of MySQL creates only a 'root'@'localhost' superuser account that has all privileges and can do anything. If the root account has an empty password, __your MySQL installation is unprotected__: Anyone can connect to the MySQL server as root without a password and be granted all privileges."_

This is precisely the case with this box. Using hydra to test common usernames with a blank password revealed that `root` access was possible without authentication.

<img width="1188" height="280" alt="1" src="https://github.com/user-attachments/assets/039ceb1e-d540-48fb-aac3-f551385e3978" />

The MySQL instance hosted a database named `htb`, which contained the flag in the `config` table, along with additional data.

<img width="1209" height="746" alt="2" src="https://github.com/user-attachments/assets/f0eb9287-4b31-49b3-8dfa-9bb3ad5442c7" />

## Conclusion

This machine demonstrates a fundamental security flaw in database configurations where default credentials remain unchanged. The ability to access the MySQL server with root privileges without a password represents a critical security vulnerability that could lead to complete data compromise.
