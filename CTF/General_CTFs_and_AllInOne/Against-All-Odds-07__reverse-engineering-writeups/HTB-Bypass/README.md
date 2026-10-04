# HTB: Bypass

## Challenge Overview

The objective of this challenge was to bypass the client-side authentication mechanism and retrieve the hidden flag from a .NET executable.

---

## Initial Analysis

The provided binary (`Bypass.exe`) was identified as a .NET Framework application. Running the executable prompted for a username and password.

Testing several credential combinations always resulted in:

```text
Wrong username and/or password
```

This suggested that the authentication logic was implemented entirely on the client side.

---
<img width="973" height="412" alt="Check_1" src="https://github.com/user-attachments/assets/f081083c-92fe-47b3-ad84-09db35834087" />

## Static Analysis with dnSpy

The executable was loaded into dnSpy for inspection.

Navigating through the decompiled code revealed the authentication function:

```csharp
public static bool 1()
{
    Console.Write(5.1);
    string text = Console.ReadLine();

    Console.Write(5.2);
    string text2 = Console.ReadLine();

    return false;
}
```
<img width="959" height="500" alt="bool1_false" src="https://github.com/user-attachments/assets/1051282d-33d6-4d98-bec5-cd9e06b98aa5" />

The function accepts user input but immediately returns `false`, meaning authentication can never succeed regardless of the supplied credentials.

### IL View

The corresponding IL instructions were:

```il
ldc.i4.0
stloc.2
ldloc.2
ret
```

`ldc.i4.0` loads Boolean FALSE onto the stack.

---

## Authentication Bypass

To force successful authentication, the instruction:

```il
ldc.i4.0
```

was modified to:

```il
ldc.i4.1
```
<img width="959" height="365" alt="patch_1" src="https://github.com/user-attachments/assets/02be4362-5d6b-425c-a6ca-3f260bb51880" />

This causes the function to always return TRUE.

After saving the patched executable, the login stage was bypassed successfully.

---

## Secret Key Validation

Once authentication was bypassed, the application prompted for a secret key.

The following method handled the validation:

```csharp
public static void 2()
{
    string secret = 5.3;

    Console.Write(5.4);
    string b = Console.ReadLine();

    bool flag = secret == b;

    if (flag)
    {
        Console.Write(5.5 + 0.2 + 5.6);
    }
    else
    {
        Console.WriteLine(5.7);
        0.2();
    }
}
```
<img width="959" height="502" alt="secret_key_fun()" src="https://github.com/user-attachments/assets/f1fbbc4b-0857-4f37-b958-f5d584a31949" />

The application compared user input against a hardcoded secret value stored in the application's encrypted resources.

---

## Bypassing the Secret Key Check

Examining the IL code revealed the comparison branch:

```il
call bool System.String::op_Equality(string,string)
stloc.2
ldloc.2
brfalse.s 0041
```
<img width="956" height="494" alt="patch_2" src="https://github.com/user-attachments/assets/61a319da-0d07-40c9-afa0-5552663a0189" />

The `brfalse.s` instruction redirected execution to the failure path when the comparison result was false.

To bypass the validation entirely, the conditional branch was modified so execution would always continue through the success path.

After saving the patched binary, any secret key input was accepted.

---

## Retrieving the Flag

Running the patched executable:

```text
Enter a username: anonym
Enter a password: 123456
Please Enter the secret Key: anything

Nice here is the Flag:
HTB{SuP3rC00lFL4g}
```
<img width="1153" height="411" alt="flag_1" src="https://github.com/user-attachments/assets/4aa78e0a-cf79-4d17-a7bf-21af9ce180d3" />

---

## Flag

```text
HTB{SuP3rC00lFL4g}
```

---

## Conclusion

This challenge demonstrated a classic client-side authentication weakness. The application relied entirely on local validation logic, making it vulnerable to straightforward IL patching using dnSpy.

Two modifications were sufficient:

1. Change the authentication function to always return TRUE.
2. Patch the secret key validation branch to force the success path.

After applying both patches, the application revealed the flag successfully.
