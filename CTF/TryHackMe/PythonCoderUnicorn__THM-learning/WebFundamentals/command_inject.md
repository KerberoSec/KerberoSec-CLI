
# Command Injection 

web vulnerability that is command injection

Command injection is also often known as “Remote Code Execution” (RCE) because of the ability to remotely execute code within an application.

Command injection is the abuse of an application's behaviour to execute commands on the operating system, using the same privileges that the application on a device is running with.

webserver runs under `joe` and permissions , attack gets those 

"Remote Code Execution" (RCE) because an attacker can trick the application into executing a series of payloads that they provide, without direct access to the machine itself (i.e. an interactive shell).

## Blind command injection

there is no direct output from the application when testing payloads. You will have to investigate the behaviours of the application to determine whether or not your payload was successful.

will need to use payloads that will cause some time delay. 
- `ping` 
- `sleep` 
- `curl http:/`
- commands are significant payloads to test

> Testing command injection this way is often complicated and requires quite a bit of experimentation, significantly as the syntax for commands varies between Linux and Windows.

useful payloads Linux :

- `ls`
- `whoami`
- `ping`
- `sleep`
- `nc` netcat can be used tp spawn a reverse shell on vulnerable app 

useful payloads Windows :

- whoami
- dir
- ping
- timeout 

## Verbose command injection

there is direct feedback from the application once you have tested a payload. For example, running the `whoami` command to see what user the application is running under.

PREVENTION

- user input is set to strict pattern match, if only digits the pattern is only [0-9]+
- input sanitization , strict rules for input

BYPASS

For example, an application may strip out quotation marks; we can instead use the hexadecimal value of this to achieve the same result.

