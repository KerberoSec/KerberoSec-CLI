# Keygenme-py
## Description
None

## Solution
The keygenme-py challenge involves generating a dynamic key based on a static base key and a username. The key is checked using a function that compares each character of the dynamic key to specific characters of a sha256 hash of the username. The solution involves calculating the sha256 hash of the username and using the resulting characters to generate the dynamic key. By adding the dynamic key to the static base key, the full key can be generated and used to solve the challenge.

```python
import hashlib
import base64

key_part_static1_trial = "picoCTF{1n_7h3_|<3y_of_"
key_part_dynamic1_trial = "xxxxxxxx"
key_part_static2_trial = "}"
key_full_template_trial = key_part_static1_trial + key_part_dynamic1_trial + key_part_static2_trial

username_trial = b"SCHOFIELD"

potential_dynamic_key = ""

# where our input begins:
offset = 23

# positions in username_trial
positions = [4, 5, 3, 6, 2, 7, 1, 8]

for p in positions:
    potential_dynamic_key += hashlib.sha256(username_trial).hexdigest()[p]

key = key_part_static1_trial + potential_dynamic_key + key_part_static2_trial
print(key)
print(len(key))
```

And we got the flag!

