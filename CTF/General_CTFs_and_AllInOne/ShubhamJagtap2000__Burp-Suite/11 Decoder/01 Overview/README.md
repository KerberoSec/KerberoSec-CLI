# Decider Overview

- The Burp Suite Decoder module allows us to manipulate data. As the name suggests, we can ***decode*** information that we capture during an attack, but we can also ***encode data*** of our own, ready to be sent to the target. 

- Decoder also allows us to create ***hashsums*** of data, as well as providing a `Smart Decode` feature which attempts to decode provided data recursively until it is back to being plaintext (like the `"Magic"` function of [Cyberchef](https://gchq.github.io/CyberChef/)).

- Let's select the Decoder tab from the top menu and take a look at the options available:

  ![image](https://user-images.githubusercontent.com/63872951/189487565-ae179c4c-b7bf-484b-9d76-bc7a40cc7a3e.png)

- This interface offers us a number of options.

   - The box on the ***left*** is where we would paste or type text to be encoded or decoded. As with most other modules of Burp Suite, we can also send data here from other sections of the framework by right-clicking and choosing `Send to Decoder`.
   - We have the option to select between treating the input as text or hexadecimal byte values at the top of the list on the right.
   - Further down the list, we have dropdown menus to `Encode`, `Decode` or `Hash` the input.
   - Finally, we have the `Smart Decode` feature, which attempts to decode the input automatically.

    ![image](https://user-images.githubusercontent.com/63872951/189487668-0c919334-ee79-45cb-9ce5-0aadab7f4075.png)

- As we add data into the input field, the interface will duplicate itself to contain the output of our transformation. 

- We can then choose to operate on this using the same options:

  ![image](https://user-images.githubusercontent.com/63872951/189487705-17d467d0-fd8b-4031-bd13-de7d73f23cec.png)
  
