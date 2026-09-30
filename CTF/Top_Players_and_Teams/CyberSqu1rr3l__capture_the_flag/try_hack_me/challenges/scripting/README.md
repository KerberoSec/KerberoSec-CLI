```
    o__ __o                             o                o        o                          
   /v     v\                          _<|>_             <|>     _<|>_                        
  />       <\                                           < >                                  
 _\o____            __o__  \o__ __o     o    \o_ __o     |        o    \o__ __o     o__ __o/ 
      \_\__o__     />  \    |     |>   <|>    |    v\    o__/_   <|>    |     |>   /v     |  
            \    o/        / \   < >   / \   / \    <\   |       / \   / \   / \  />     / \ 
  \         /   <|         \o/         \o/   \o/     /   |       \o/   \o/   \o/  \      \o/ 
   o       o     \\         |           |     |     o    o        |     |     |    o      |  
   <\__ __/>      _\o__</  / \         / \   / \ __/>    <\__    / \   / \   / \   <\__  < > 
                                             \o/                                          |  
                                              |                                   o__     o  
                                             / \                                  <\__ __/>
```
In this TryHackMe room, we learn some basic scripting by solving some challenges! [^1]

[Easy] Base64: What is the final string?
-----------------------------------------------------------------------------------------
**This file has been base64 encoded 50 times, write a script to retrieve the flag.**

We are given the following procedure to decode the file `b64_1550406728131.txt` that can
be downloaded from the task description and are asked to do this both in Bash and Python.

1. Read input from the file
2. Use function to decode the file
3. Do the process in a loop

So, we write two scripts, to repeatedly base64-decode the file and thus obtain the flag.
Note, that we can proceed to either execute `./base64_decoder.sh b64_1550406728131.txt`
or `./base64_decoder.py b64_1550406728131.txt`

[Medium] Gotta Catch em All: What number do you get after all operations?
-----------------------------------------------------------------------------------------
**We need to write a script that connects to a webserver, do an operation on a number
and then move onto the next port.**

For this task, we need to write a script that connects to a webserver on the correct
port, performs a mathematical operation on a number and moves to the next port number. We
are advised to start at zero and that the format is *operation, number, next port*. In 
our script, we thus want to do an operation on the current port number with the given
*number* and move to the *next port*. Note, that each port is only live for four seconds
and that we may have to wait until port *1337* becomes live again.

1. Create a socket in Python using the `sockets` library
2. Connect to the port
3. Send an operation
4. View the response and continue

At first, we attempt to work with the port number that is displayed on the webpage under
port *3010* by printing the response and filtering for the port number. But then, we read
the instruction text again, and find out that the first port number should be *1337* at
all times. We may have to wait for it to become available though. Finally, we can execute
the Python script with the webserver's IP address in the attacking machine
`./webserver_operation.py [TARGET_MACHINE_IP_ADDRESS]` and obtain the final number for
the flag.

[Hard] Encrypted Server Chit Chat
-----------------------------------------------------------------------------------------
**TBC**

[^1]: https://tryhackme.com/room/scripting
