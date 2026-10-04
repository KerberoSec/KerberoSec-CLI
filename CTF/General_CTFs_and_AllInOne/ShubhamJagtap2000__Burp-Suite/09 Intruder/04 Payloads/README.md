# Intruder "Payloads" Sub-tab

- The "Payloads" sub-tab; this is split into four sections:

  - **<ins>The Payload Sets</ins>** section allows us to choose which position we want to configure a set for as well as what type of payload we would like to use.

    - When we use an attack type that only allows for a single payload set (i.e. Sniper or Battering Ram), the dropdown menu for `Payload Set` will only have one option, regardless of how many positions we have defined.
    - If we are using one of the attack types that use multiple payload sets (i.e. Pitchfork or Cluster Bomb), then there will be one item in the dropdown for each position.
    - **Note:** Multiple positions should be read from top to bottom, then left to right when being assigned numbers in the "Payload set" dropdown. 
    - For example, with `two positions (username=§pentester§&password=§Expl01ted§)`, the first item in the payload set dropdown would refer to the username field, and the second would refer to the password field.

      - The second dropdown in this section is the payload type. By default, this is a "Simple list": which, as the name suggests, lets us ***load in a wordlist to use***. 
      - There are many other payload types available: some common ones include: `Recursive Grep, Numbers, and Username generator`. It is well worth perusing this list to get a feel for the wide range of options available.
  
  - **<ins>Payload Options</ins>** differ depending on the payload type we select for the current payload set. For example, a "Simple List" payload type will give us a box to add and remove payloads to and from the set:
    - Screenshot of the payload options for a simple list
    - We can do this manually using the `Add` text box, paste lines in with `Paste`, or `Load...` from a file. 
    - The `Remove` button removes the currently selected line only. 
    - The `Clear` button clears the entire list. **Be warned:** loading extremely large lists in here can cause Burp to crash!
    - By contrast, the options for a `Numbers` payload type allows us to change options such as the range of numbers used and the base that we are working with.

  - **<ins>Payload Processing</ins>** allows us to ***define rules to be applied to each payload in the set before being sent to the target***. 
    
    - For example, we could capitalise every word or skip the payload if it matches a regex. 
    - You may not use this section particularly regularly, but you will definitely appreciate it when you do need it!

  - Fourth section is **<ins>Payload Encoding</ins>** section. This section allows us to ***override the default URL encoding options that are applied automatically to allow for the safe transmission of our payload***. 
    
    - Sometimes it can be beneficial to not URL encode these standard `unsafe` characters, which is where this section comes in. 
    - We can either adjust the list of characters to be encoded or outright uncheck the `URL-encode these characters` checkbox. 

# Answer the following questions

Which payload type lets us load a list of words into a payload set?
```
Simple List
```
Which Payload Processing rule could we use to add characters at the end of each payload in the set?
```
Add Suffix
```
