# Simple Programming

### Prompt

Can you help me? I need to know how many lines there are where the number of 0's is a multiple of 3 or the numbers of 1s is a multiple of 2. Please! 

Here is the file: https://mega.nz/#!7aoVEKhK!BAohJ0tfnP7bISIkbADK3qe1yNEkzjHXLKoJoKmqLys

### Approach

- It is a basic programming challenge, so I wrote a simple Python script to solve it.

  ```
  #!/usr/bin/python

  with open("data.dat") as fp:
    count = 0
      for line in fp.readlines():
        if line.count('0') % 3 == 0 or line.count('1') % 2 == 0:
          count += 1

   print count

  ```

- This script does not account for 0%2 or 0%3, but was sufficient enough.

- I also ran the following command to give it permission to be executed.

  ```
  chmod +x solution.py
  ```

- Running it with the obtained file, revealed the flag.

   ```
   .solution.py/
   ```

- Flag obtained : 6662
