# SQL query (sql, password cracking)

## Usage

Ubuntu:

~~~
./ubuntu_setup.sh
~~~

Other Linux:

~~~
Modify the ubuntu_setup.sh to fit your distro. Good luck!
~~~

## Vulnerability

After exploiting onto the webserver you exfil the backend database used for authentication. A python script has been written to interact with the database. It is your job to get the data out.

There are two flags for this challenge. One for finding the appropriate record and another for cracking the hash.

