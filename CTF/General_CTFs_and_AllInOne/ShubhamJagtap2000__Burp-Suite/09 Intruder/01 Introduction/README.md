# Introduction

- Intruder is Burp Suite's in-built `fuzzing` tool. It allows us to take a request (usually captured in the Proxy before being passed into Intruder) and use it as a template to send many more requests with slightly altered values automatically. 

- For example, by capturing a request containing a login attempt, we could then configure Intruder to swap out the username and password fields for values from a wordlist, effectively allowing us to **bruteforce** the login form. Similarly, we could pass in a `fuzzing[1] wordlist` and use Intruder to fuzz for **subdirectories, endpoints, or virtual hosts**. 

- This functionality is very similar to that provided by command-line tools such as `Wfuzz` or `Ffuf`.

- In short, as a method for automating requests, Intruder is extremely powerful: there is just `one problem`: to access the full speed of Intruder, we need **Burp Professional**. We can still use Intruder with Burp Community, but it is heavily rate-limited. This speed restriction means that many hackers choose to use other tools for fuzzing and bruteforcing.

- Limitations aside, Intruder is still very useful, so it is well worth learning to use it properly.
