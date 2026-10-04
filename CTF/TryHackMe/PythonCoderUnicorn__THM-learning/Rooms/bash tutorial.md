#Bash #FreeRoom 

https://tryhackme.com/room/bashscripting

Must have at the top of the `bash-tut.sh` file
- `# !/bin/bash`

make bash executable 
- `chmod +x file.sh` then run  `./ 

inside the `bash-tut.sh`
- `echo "TryHackMe Bash Scripting"`

## variables, no spaces!

- `name='hacker'`
- `echo $name`
- `level="excellent"`
- `echo "$name is $level"`

```
echo Enter hacking status:
read status
echo "Your hacking status is $status"
```

## debugging

```
set -x
echo "debugging"
set +x
echo "debugging done"
```

## parameters

```
name=$1     # pass name in terminal
echo $name
day=$2
echo $day
```

How can we get the filename of our current script(aka our first argument)?
- `$0`

If a script asks us for input how can we direct our input into a variable called ‘test’ using “read”
- `read test`

## arrays (0 index)

- `transport=['car','train','bike','bus']`

```
echo "${transport[@]}"
echo "${transport[1]}"

## change element or delete = unset
transport[0]='spaceship'
echo "${transport[@]}"

cars=('honda' 'audi' 'bmw' 'tesla')
echo "${cars[1]}"
```

## conditionals

- `-eq equals , -ne != , -gt > , -lt < `
- `count=10`

```
if [ $count -eq 10 ]
	then
	echo "true"
else
	echo "false"
fi
```

```
value="guessme"
guess=$1

if [ "$value" = "$guess" ]
	then
	echo "they are equal"
else
	echo "they are not equal"
fi
```

```
filename=$1

if [ -f "$filename" ] && [ -w "$filename" ]
	then
	echo "hello" > $filename
else
	touch "$filename"
	echo "hello" > $filename
fi
```

---
### other

- `printf "Hello\n"`
- `echo $(whoami)`
- 

```
terminal run and "text" "text2" "text3"

echo "text string is $1 is one, and $2 is two and last is $3"
```

```
echo "what is x?"
read x
echo "Wow, $x is so cool"
```

```
echo "what is linux? "
read linux

if [ $linux ]; then
	echo "$linux sounds awesome"
else
	echo "ah nevermind then"
# important to have fi!
fi
```

```
# prints the just the broadcast
ifconfig | grep "broadcast" | awk '{print $2}' 

# alias whatismyipaddress="echo $(ifconfig | grep broadcast | awk '{print $2}')"
```

```
read -p "What are you hacking? " stuff
echo "Enjoy hacking $stuff"
```

## Reference

- https://tryhackme.com/room/bashscripting
-  https://youtu.be/tK9Oc6AEnR4
-  https://linuxconfig.org/bash-scripting-cheat-sheet

