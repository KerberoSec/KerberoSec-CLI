# The Payload (Hard)

**Q1. During execution, the malware initializes the COM library on its main thread. Based on the imported functions, which DLL is responsible for providing this functionality? (filename.ext)**

ole32.dll

**Q2. Which GUID is used by the binary to instantiate the object containing the data and code for execution? (********-****-****-****-************)**

DABCD999-1234-4567-89AB-1234567890FF

**Q3. Which .NET framework feature is the attacker using to bridge calls between a managed .NET class and an unmanaged native binary? (string)**

COM Interop

**Q4. Which Opcode in the disassembly is responsible for calling the first function from the managed code? (** ** **)**

FF 50 68

**Q5. Identify the multiplication and addition constants used by the binary's key generation algorithm for decryption. (*, **h)**

7, 42h

**Q6. Which Opcode in the disassembly is responsible for calling the decryption logic from the managed code? (** ** **)**

FF 50 58

**Q7. Which Win32 API is being utilized by the binary to resolve the killswitch domain name? (string)**

getaddrinfo

**Q8. Which network-related API does the binary use to gather details about each shared resource on a server? (string)**

NetShareEnum

**Q9. Which Opcode is responsible for running the encrypted payload? (** ** **)**

ff 50 60

**Q10. Find → Block → Flag: Identify the killswitch domain, spawn the Docker to block it, andclaim the flag. (HTB{*******_**********_********_*****})**

HTB{Eternal_Companions_Reunited_Again}
