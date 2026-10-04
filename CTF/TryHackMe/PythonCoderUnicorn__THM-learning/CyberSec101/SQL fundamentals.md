
#SQL 

https://tryhackme.com/r/room/sqlfundamentals

Cyber security is a broad topic that covers a wide range of subjects, but few of those are as ubiquitous as databases. Whether you’re working on securing a web application, working in a SOC and using a SIEM, configuring user authentication/access control, or using malware analysis/threat detection tools (the list goes on), you will in some way be relying on databases. For example, on the offensive side of security, it can help us better understand SQL vulnerabilities, such as SQL injections, and create queries that help us tamper or retrieve data within a compromised service. On the other hand, on the defensive side, it can help us navigate through databases and find suspicious activity or relevant information; it can also help us better protect a service by implementing restrictions when needed.

Because databases are ubiquitous, it is important to understand them, and this room will be your first step in that direction. We’ll go through the basics of databases, covering key terms, concepts and different types before getting to grips with SQL.

## Introducing Databases

Okay, so you’ve been told just how important they are. Now, it's time to understand what they are in the first place. As mentioned in the introduction, databases are so ubiquitous that you very likely interact with systems that are using them. Databases are an organised collection of structured information or data that is easily accessible and can be manipulated or analysed. That data can take many forms, such as user authentication data (such as usernames and passwords), which are stored and checked against when authenticating into an application or site (like TryHackMe, for example), user-generated data on social media (Like Instagram and Facebook) where data such as user posts, comments, likes etc are collected and stored, as well as information such as watch history which is stored by streaming services such as Netflix and used to generate recommendations. 

I’m sure you get the point: databases are used extensively and can contain many different things. It’s not just massive-scale businesses that use databases. Smaller-scale businesses, when setting up, will almost certainly have to configure a database to store their data. Speaking of kinds of databases, let’s take a look now at what those are.  

### Different Types of Databases

Now it makes sense that something is used by so many and for (relatively) so long that there would be multiple types of implementations. There are quite a few different types of databases that can be built, but for this introductory room, we are going to focus on the two primary types: **relational databases** (aka SQL) vs **non-relational databases** (aka NoSQL).

**Relational databases:** Store structured data, meaning the data inserted into this database follows a structure. For example, the data collected on a user consists of first_name, last_name, email_address, username and password. When a new user joins, an entry is made in the database following this structure. This structured data is stored in rows and columns in a table (all of which will be covered shortly); relationships can then be made between two or more tables (for example, user and order_history), hence the term relational databases.

**Non-relational databases:** Instead of storing data the above way, store data in a non-tabular format. For example, if documents are being scanned, which can contain varying types and quantities of data, and are stored in a database that calls for a non-tabular format. Here is an example of what that might look like:

```bash
 {
    _id: ObjectId("4556712cd2b2397ce1b47661"),
    name: { first: "Thomas", last: "Anderson" },
    date_of_birth: new Date('Sep 2, 1964'),
    occupation: [ "The One"],
    steps_taken : NumberLong(4738947387743977493)
}
```

In terms of what database should be chosen, it always comes down to the context in which the database is going to be used. Relational databases are often used when the data being stored is reliably going to be received in a consistent format, where accuracy is important, such as when processing e-commerce transactions. Non-relational databases, on the other hand, are better used when the data being received can vary greatly in its format but need to be collected and organised in the same place, such as social media platforms collecting user-generated content.  

### Tables, Rows and Columns

Now that we’ve defined the two primary types of databases, we’ll focus on relational databases. We’ll start by explaining **tables**, **rows**, and **columns**. All data stored in a relational database will be stored in a **table**; for example, a collection of books in stock at a bookstore might be stored in a table named “Books”.

```
id     name                      date
1      android security          2014-01-14
2      bug bounty bootcamp       2021-03-18
```

When creating this table, you would need to define what pieces of information are needed to define a book record, for example, “id”, “Name”, and “Published_date”. These would then be your **columns**; when these columns are being defined, you would also define what data type this column should contain; if an attempt is made to insert a record into a database where the data type does not match, it is rejected. The data types that can be defined can vary depending on what database you are using, but the core data types used by all include Strings (a collection of words and characters), Integers (numbers), floats/decimals (numbers with a decimal point) and Times/Dates. 

Once a table has been created with the columns defined, the first record would be inserted into the database, for example, a book named “Android Security Internals” with an id of “1” and a publication date of “2014-10-14”. Once inserted, this record would be represented as a **row**.

### Primary and Foreign Keys

Once a table has been defined and populated, more data may need to be stored. For instance, we want to create a table named “Authors” that stores the authors of the books sold in the store. Here is a very clear example of a relationship. A book (stored in the Books table) is written by an author (stored in the Authors table). If we wanted to query for a book in our story but also have the author of that book returned, our data would need to be related somehow; we do this with keys. There are two types of **keys**:

**Primary Keys**: A primary key is used to ensure that the data collected in a certain column is unique. That is, there needs to be a way to identify each record stored in a table, a value unique to that record and is not repeated by any other record in that table. Think about matriculation numbers in a university; these are numbers assigned to a student so they can be uniquely identified in records (as sometimes students can have the same name). A column has to be chosen in each table as a primary key; in our example, “id” would make the most sense as an id has been uniquely created for each book where, as books can have the same publication date or (in rarer cases) book title. Note that there can only be one primary key column in a table.

**Foreign Keys**: A foreign key is a column (or columns) in a table that also exists in another table within the database, and therefore provides a link between the two tables. In our example, think about adding an “author_id” field to our “Books” table; this would then act as a foreign key because the author_id in our Books table corresponds to the “id” column in the author table. Foreign keys are what allow the relationships between different tables in relational databases. Note that there can be more than one foreign key column in a table.

```
What type of database should you consider using if the data you're going to be storing will vary greatly in its format?

Non-relational database

What type of database should you consider using if the data you're going to be storing will reliably be in the same structured format?

relational database

In our example, once a record of a book is inserted into our "Books" table, it would be represented as a ___ in that table?

row

Which type of key provides a link from one table to another?

foreign key

which type of key ensures a record is unique within a table?

primary key

```

## SQL 

Now, all of this theoretically sounds great, but in practice, how do databases work? How would you go and make your first table and populate it with data? What would you use? Databases are usually controlled using a Database Management System (DBMS). Serving as an interface between the end user and the database, a DBMS is a software program that allows users to retrieve, update and manage the data being stored. Some examples of DBMSs include MySQL, MongoDB, Oracle Database and Maria DB.

The interaction between the end user and the database can be done using SQL (Structured Query Language). SQL is a programming language that can be used to query, define and manipulate the data stored in a relational database. 

## The Benefits of SQL and Relational Databases

SQL is almost as ubiquitous as databases themselves, and for good reason. Here are some of the benefits that come with learning and using to use SQL:  

- **It's _fast_:** Relational databases (aka those that SQL is used for) can return massive batches of data almost instantaneously due to how little storage space is used and high processing speeds. 
  
- **Easy to Learn:** Unlike many programming languages, SQL is written in plain English, making it much easier to pick up. The highly readable nature of the language means users can concentrate on learning the functions and syntax.
  
- **Reliable:** As mentioned before, relational databases can guarantee a level of accuracy when it comes to data by defining a strict structure into which data sets must fall in order to be inserted.
  
- **Flexible:** SQL provides all kinds of capabilities when it comes to querying a database; this allows users to perform vast data analysis tasks very efficiently.

>[!info]
> mysql -u root -p
> password: tryhackme

create database
```
CREATE DATABASE database_name;
```

Run the following command to create a database named `thm_bookmarket_db`:
```
CREATE DATABASE thm_bookmarket_db;
show databases;

+-----------------------------------------------+
| Database                                      |
+-----------------------------------------------+
| THM{575a947132312f97b30ee5aeebba629b723d30f9} |
| information_schema                            |
| mysql                                         |
| performance_schema                            |
| sys                                           |
| task_4_db                                     |
| thm_bookmarket_db                             |
| thm_books                                     |
| thm_books2                                    |
| tools_db                                      |
+-----------------------------------------------+
10 rows in set (0.01 sec)

```

use database 
```
USE thm_bookmarket_db;

```

remove database
```
DROP database database_name;
```

## Table Statements

Now that you can create, list, use, and remove databases, it's time to examine how we would populate those databases with tables and interact with those tables.

```
create TABLE book_inventory (
	book_id INT AUTO_INCREMENT PRIMARY KEY,
	book_name VARCHAR(255) NOT NULL,
	publication_date DATE
);

show tables;

+-----------------------------+
| Tables_in_thm_bookmarket_db |
+-----------------------------+
| book_inventory              |
+-----------------------------+
1 row in set (0.00 sec)

```

DESCRIBE
If we want to know what columns are contained within a table (and their data type), we can describe them using the `DESCRIBE` command (which can also be abbreviated to `DESC`). Describe the table you have just created using the following command:

```
describe book_inventory;

+------------------+--------------+------+-----+---------+----------------+
| Field            | Type         | Null | Key | Default | Extra          |
+------------------+--------------+------+-----+---------+----------------+
| book_id          | int          | NO   | PRI | NULL    | auto_increment |
| book_name        | varchar(255) | NO   |     | NULL    |                |
| publication_date | date         | YES  |     | NULL    |                |
+------------------+--------------+------+-----+---------+----------------+
3 rows in set (0.00 sec)

```

ALTER
Once you have created a table, there may come a time when your need for the dataset changes, and you need to alter the table. This can be done using the `ALTER` statement. Let’s now imagine that we have decided that we actually want to have a column in our book inventory that has the page count for each book. Add this to our table using the following statement:
```
alter table book_inventory
add page_count INT;

mysql> describe book_inventory;
+------------------+--------------+------+-----+---------+----------------+
| Field            | Type         | Null | Key | Default | Extra          |
+------------------+--------------+------+-----+---------+----------------+
| book_id          | int          | NO   | PRI | NULL    | auto_increment |
| book_name        | varchar(255) | NO   |     | NULL    |                |
| publication_date | date         | YES  |     | NULL    |                |
| page_count       | int          | YES  |     | NULL    |                |
+------------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)

```

DROP
```
drop table table_name;
```

```
show databases;

+-----------------------------------------------+
| Database                                      |
+-----------------------------------------------+
| THM{575a947132312f97b30ee5aeebba629b723d30f9} |
| information_schema                            |
| mysql                                         |
| performance_schema                            |
| sys                                           |
| task_4_db                                     |
| thm_bookmarket_db                             |
| thm_books                                     |
| thm_books2                                    |
| tools_db                                      |
+-----------------------------------------------+
10 rows in set (0.00 sec)

In the list of available databases, you should also see the  `task_4_db` database. Set this as your active database and list all tables in this database; what is the flag present here?

use task_4_db;
show tables;

+-----------------------------------------------+
| Tables_in_task_4_db                           |
+-----------------------------------------------+
| THM{692aa7eaec2a2a827f4d1a8bed1f90e5e49d2410} |
+-----------------------------------------------+
1 row in set (0.00 sec)

```

## CRUD

**CRUD** stands for **C**reate, **R**ead, **U**pdate, and **D**elete, which are considered the basic operations in any system that manages data.

Let's explore all these different operations when working with **MySQL**. In the next two tasks, we will be using the **books** table that is part of the database **thm_books**. We can access it with the statement `use thm_books;`.

### Create Operation (INSERT)

The **Create** operation will create new records in a table. In MySQL, this can be achieved by using the statement `INSERT INTO`, as shown below.

```
INSERT INTO books (id, name, published_date, description) VALUES (1, "Android Security Internals", "2014-10-14", "An In-Depth Guide to Android's Security Architecture");
```

### Read Operation (SELECT)

The **Read** operation, as the name suggests, is used to read or retrieve information from a table. We can fetch a column or all columns from a table with the `SELECT` statement, as shown in the next example.

```
select * from books;

+----+----------------------------+----------------+--------------------------
| id | name                       | published_date | description                
+----+----------------------------+----------------+--------------------------
|  1 | Android Security Internals | 2014-10-14     | An In-Depth Guide to Android's Security Architecture   |
|  2 | Bug Bounty Bootcamp        | 2021-11-16     | The Guide to Finding and Reporting Web Vulnerabilities |
|  3 | Car Hacker's Handbook      | 2016-02-25     | A Guide for the Penetration Tester                     |
|  4 | Designing Secure Software  | 2021-12-21     | A Guide for Developers     
|  5 | Ethical Hacking            | 2021-11-02     | A Hands-on Introduction to Breaking In                 |
|  6 | Ethical Hacking            | 2021-11-02     |                                                        |
+----+----------------------------+----------------+--------------------------

```

### Update Operation (UPDATE)

The **Update** operation modifies an existing record within a table, and the same statement, `UPDATE`, can be used for this.

```
UPDATE books SET description = "An In-Depth Guide to Android's Security Architecture." WHERE id = 1;
```

```
# don't run for further examples ---
UPDATE books SET description = "An In-Depth Guide to Android's Security Architecture." WHERE id = 1;
```

```
Using the `tools_db` database, what is the name of the tool in the `hacking_tools` table that can be used to perform man-in-the-middle attacks on wireless networks?

show databases;
use tools_db;
show tables;
use hacking_tools;

select * from hacking_tools;

| id | name             | category             | description        | amount |
+----+------------------+----------------------+--------------------------------
|  1 | Flipper Zero     | Multi-tool           | A portable multi-tool for pentesters and geeks in a toy-like form       |    169 |
|  2 | O.MG cables      | Cable-based attacks  | Malicious USB cables that can be used for remote attacks and testing    |    180 |
|  3 | Wi-Fi Pineapple  | Wi-Fi hacking        | A device used to perform man-in-the-middle attacks on wireless networks |    140 |
|  4 | USB Rubber Ducky | USB attacks          | A USB keystroke injection tool disguised as a flash drive               |     80 |
|  5 | iCopy-XS         | RFID cloning         | A tool used for reading and cloning RFID cards for security testing     |    375 |
|  6 | Lan Turtle       | Network intelligence | A covert tool for remote access and network intelligence gathering      |     80 |
|  7 | Bash Bunny       | USB attacks          | A multi-function USB attack device for penetration testers              |    120 |
|  8 | Proxmark 3 RDV4  | RFID cloning         | A powerful RFID tool for reading, writing, and analyzing RFID tags      |    300 |

wi-fi pineapple

Using the `tools_db` database, what is the shared category for both **USB Rubber Ducky** and **Bash Bunny**?

usb attack
```

## clauses

A clause is a part of a statement that specifies the criteria of the data being manipulated, usually by an initial statement. Clauses can help us define the type of data and how it should be retrieved or sorted. 

In previous tasks, we already used some clauses, such as `FROM` that is used to specify the table we are accessing with our statement and `WHERE`, which specifies which records should be used.  

This task will focus on other clauses: `DISTINCT`, `GROUP BY`, `ORDER BY`, and `HAVING`.  

### DISTINCT Clause

The `DISTINCT` clause is used to avoid duplicate records when doing a query, returning only unique values.
Let's use a query `SELECT * FROM books` and observe the results below.
The query's output displays all the content of the table **books**, and the record **Ethical Hacking** is displayed twice. Let's perform the query again, but this time, using the `DISTINCT` clause.

```
mysql> select distinct name from books;
+----------------------------+
| name                       |
+----------------------------+
| Android Security Internals |
| Bug Bounty Bootcamp        |
| Car Hacker's Handbook      |
| Designing Secure Software  |
| Ethical Hacking            |
+----------------------------+

```

### GROUP BY Clause

The `GROUP BY` clause aggregates data from multiple records and **groups** the query results in columns. This can be helpful for aggregating functions.

```
mysql> select name, count(*) from books group by name;
+----------------------------+----------+
| name                       | count(*) |
+----------------------------+----------+
| Android Security Internals |        1 |
| Bug Bounty Bootcamp        |        1 |
| Car Hacker's Handbook      |        1 |
| Designing Secure Software  |        1 |
| Ethical Hacking            |        2 |
+----------------------------+----------+

```

### ORDER BY Clause

The `ORDER BY` clause can be used to sort the records returned by a query in ascending or descending order. Using functions like `ASC` and `DESC` can help us to accomplish that, as shown below in the next two examples.

```
select * from books order by published_date asc;

| id | name                       | published_date | description                
|  1 | Android Security Internals | 2014-10-14     | An In-Depth Guide to Android's Security Architecture.  |
|  3 | Car Hacker's Handbook      | 2016-02-25     | A Guide for the Penetration Tester                     |
|  5 | Ethical Hacking            | 2021-11-02     | A Hands-on Introduction to Breaking In                 |
|  6 | Ethical Hacking            | 2021-11-02     |                            
|  2 | Bug Bounty Bootcamp        | 2021-11-16     | The Guide to Finding and Reporting Web Vulnerabilities |
|  4 | Designing Secure Software  | 2021-12-21     | A Guide for Developers                                 |

select * from books order by published_date desc;
```

### HAVING Clause

The `HAVING` clause is used with other clauses to filter groups or results of records based on a condition. In the case of `GROUP BY`, it evaluates the condition to `TRUE` or `FALSE`, unlike the `WHERE` clause `HAVING` filters the results after the aggregation is performed.

```
mysql> select name, count(*) from books group by name having name like "%Hack%"; 

+-----------------------+----------+
| name                  | count(*) |
+-----------------------+----------+
| Car Hacker's Handbook |        1 |
| Ethical Hacking       |        2 |
+-----------------------+----------+

```

```
Using the `tools_db` database, what is the total number of distinct categories in the `hacking_tools` table?

mysql> select distinct category from hacking_tools;
+----------------------+
| category             |
+----------------------+
| Multi-tool           |
| Cable-based attacks  |
| Wi-Fi hacking        |
| USB attacks          |
| RFID cloning         |
| Network intelligence |
+----------------------+
6 rows in set (0.00 sec)

select * from hacking_tools order by name asc;

bash bunny

desc;

wi-fi peinapple  
```

## operators

When working with **SQL** and dealing with logic and comparisons, **operators** are our way to filter and manipulate data effectively. Understanding these operators will help us to create more precise and powerful queries. In the next two tasks, we will be using the **books** table that is part of the database **thm_books2**. We can access it with the statement `use thm_books2;`.

## Logical Operators

These operators test the truth of a condition and return a boolean value of `TRUE` or `FALSE`. Let's explore some of these operators next.  

### LIKE Operator

The `LIKE` operator is commonly used in conjunction with clauses like `WHERE` in order to filter for specific patterns within a column. Let's continue using our DataBase to query an example of its usage.

```
thm_books2

select * from books where description like "%guide%";

 id | name                       | published_date | description                 
|  1 | Android Security Internals | 2014-10-14     | An In-Depth Guide to Android's Security Architecture.  |
|  2 | Bug Bounty Bootcamp        | 2021-11-16     | The Guide to Finding and Reporting Web Vulnerabilities |
|  3 | Car Hacker's Handbook      | 2016-02-25     | A Guide for the Penetration Tester                     |
|  4 | Designing Secure Software  | 2021-12-21     | A Guide for Developers 
```

The query above returns a list of records from the books filtered, but the ones using the `WHERE` clause that contains the word guide by using the `LIKE` operator.  

### AND Operator

The `AND` operator uses multiple conditions within a query and returns `TRUE` if all of them are true.

```
select * from books where category = "Offensive Security" and name = "Bug Bounty Bootcamp";

```

### OR Operator

The `OR` operator combines multiple conditions within queries and returns `TRUE` if at least one of these conditions is true.

```
select * from books where name like "%Android%" or name like "%iOS%";
```

### NOT Operator

The `NOT` operator reverses the value of a boolean operator, allowing us to exclude a specific condition.

```
select * from books where not description like "%guides%";

|  1 | Android Security Internals | 2014-10-14     | An In-Depth Guide to Android's Security Architecture.  |
|  2 | Bug Bounty Bootcamp        | 2021-11-16     | The Guide to Finding and Reporting Web Vulnerabilities |
|  3 | Car Hacker's Handbook      | 2016-02-25     | A Guide for the Penetration Tester                     |
|  4 | Designing Secure Software  | 2021-12-21     | A Guide for Developers     
|  5 | Ethical Hacking            | 2021-11-02     | A Hands-on Introduction to Breaking In                 |
|  6 | Ethical Hacking            | 2021-11
```

### BETWEEN Operator

The `BETWEEN` operator allows us to test if a value exists within a defined **range**.

```
SELECT * FROM books WHERE id BETWEEN 2 AND 4;
```

### comparison

```
SELECT * FROM books WHERE name = "Designing Secure Software";
```

### not equal 

```
SELECT * FROM books WHERE category != "Offensive Security";
```

### less than

```
SELECT * FROM books WHERE published_date < "2020-01-01";
```

### greater than

```
SELECT * FROM books WHERE published_date > "2020-01-01";

SELECT * FROM books WHERE published_date <= "2021-11-15";

SELECT * FROM books WHERE published_date >= "2021-11-02";
```

```
Using the `tools_db` database, which tool falls under the **Multi-tool** category and is useful for **pentesters** and **geeks**?

flipper zero

Using the `tools_db` database, what is the category of tools with an amount **greater than** or **equal** to **300**?

rfid cloning

Using the `tools_db` database, which tool falls under the **Network intelligence** category with an amount **less than 100**?

lan turtle

```

## functions

When working with Data, functions can help us streamline queries and operations and manipulate data. Let's explore some of these functions next.

String Functions

Strings functions perform operations on a string, returning a value associated with it.

CONCAT() Function

This function is used to add two or more strings together. It is useful to combine text from different columns.

```
SELECT CONCAT(name, " is a type of ", category, " book.") AS book_info FROM books;
```

GROUP_CONCAT() Function

This function can help us to concatenate data from multiple rows into one field. Let's explore an example of its usage.
```
SELECT category, GROUP_CONCAT(name SEPARATOR ", ") AS books FROM books GROUP BY category;
```

The query above groups the **books** by **category** and concatenates the titles of books within each category into a **single string**.

SUBSTRING() Function

This function will retrieve a substring from a string within a query, starting at a determined position. The length of this substring can also be specified.

```
SELECT SUBSTRING(published_date, 1, 4) AS published_year FROM books;
```

In the query above, we can observe how it extracts the first **four** characters from the **published_date** column and stores them in the **published_year** column.

LENGTH() Function

This function returns the number of characters in a string. This includes spaces and punctuation. We can find an example below.

```
SELECT LENGTH(name) AS name_length FROM books;
```

As we can observe above, the query calculates the length of the string within the **name** column and stores it in a column named **name_length**.

Aggregate Functions

These functions aggregate the value of multiple rows within one specified criteria in the query; It can combine multiple values into one result.

COUNT() Function

This function returns the number of records within an expression, as the example below shows.

```
SELECT COUNT(*) AS total_books FROM books;
```

This query above counts the total number of rows in the **books** table. The result is **5**, as there are five books in the books table, and it's stored in the **total_books** column.

SUM() Function

This function sums all values (not NULL) of a determined column.

**Note:** There is no need to execute this query. This is just for example purposes.

```
SELECT SUM(price) AS total_price FROM books;
```

The query above calculates the total sum of the **price** column. The result provides the aggregate price of all books in the column **total_price**.

MAX() Function

This function calculates the maximum value within a provided column in an expression.

```
SELECT MAX(published_date) AS latest_book FROM books;
```

The query above retrieves the latest publication (maximum value) date from the **books** table. The result **2021-12-21** is stored in the column **latest_book**.

MIN() Function

This function calculates the minimum value within a provided column in an expression.

```
SELECT MIN(published_date) AS earliest_book FROM books;
```

```
Using the `tools_db` database, what is the tool with the longest name based on character length?

usb rubber ducky

Using the `tools_db` database, what is the total sum of all tools?
select sum(amount) as total from hacking_tools;
1444

Using the `tools_db` database, what are the tool names where the amount does not end in **0**, and **group** the tool names **concatenated** by " & ".

SELECT GROUP_CONCAT(name SEPARATOR “ & “) AS name_nonzero  FROM hacking_tools  WHERE SUBSTRING(amount, -1, 1) != 0;

Flipper Zero & iCopy-XS
```

