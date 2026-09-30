# Chall

Below is the source code of the chall.
This is basically an English language text encrypted by Caesar cipher with a key changing at every word.
The flag is hidden in the keys so the only goal is to retrieve the key for each word and then we are able to recover the flag.

```python
import string
import re

text = open('text.txt','r').read().lower()
flag = open('flag.txt','r').read().strip()[4:-1].replace('_','+')
chars = string.ascii_letters + string.digits + '+/='
regex = re.compile('[' + chars + ']{5,70}')
assert re.fullmatch(regex, flag)

def caesar(msg, shift):
	return ''.join(chars[(chars.index(c) + shift) % len(chars)] for c in msg)

i = 0
count = 0
while i < len(text):
	if text[i] not in string.ascii_lowercase:
		print(text[i], end = '')
		i += 1
	else:
		j = i
		while text[j] in string.ascii_lowercase: j += 1
		print(caesar(text[i:j], chars.index(flag[count % len(flag)])), end = '')
		count += 1
		i = j

def solve(indices_list):
	flag = ""
	for index in indices_list:
		flag += chars[index]
	return flag

print(len(chars))
```

# Solution

Here is the solving script for this challenge which was mostly contributed by @flumm1ba3r.
The idea is simply to recover each key by bruteforcing the possibilities for each word and then keeping only the valid plainword located in a dictionnary (here enchant dictionnary).
Then we can recover the key.

```python
import string
import enchant

chars = string.ascii_letters + string.digits + "+/="  # (65 characters)

def caesar_decrypt(segment, shift):
    """
    Given a segment (a string composed solely of characters from chars),
    shift each character backward by 'shift' positions (mod len(chars)).
    If any character is not in chars, a ValueError is raised.
    """
    return ''.join(chars[(chars.index(c) - shift) % len(chars)] for c in segment)

ciphertext = (
    "AtvDxK lAopjz /i + vhw c6 uwnshnuqjx ymfy kymhi Kyv 47+3l/eh Bs kpfkxkfwcnu Als "
    "9phdgj9 +ka ymzuBGxmFq 6fdglk8i CICDowC sjxir bjme+pfwfkd 6li=fj=kp nCplEtGtEJ "
    "lyo qeb INKLNBM vm ademb7697 ollqba lq DitCmA xzhm fx ef7dd7ii wIvv eggiww GB "
    "kphqtocvkqp 3d6 MAx ilsplm /d rpfkd vnloov hc nruwtAj xDxyjrx vexliv KyrE +3hc Gurz "
    "jcemgt ixlmgw 9f7gmj5/9k obpmlkpf/ib mzp 8k/=64c ECo sj qb=eklildv =k loGznlEpD "
    "qzC qo+kpm+obk=v vHEEtuHKtMBHG huk h7if75j/d9 mofs+=v zkloh lqAkwCzioqvo rfqnhntzx "
    "fhynAnynjx b/a7 JKvrCzEx hexe BE ecwukpi 63c397 MAxLx wypujpwslz 3/c ql irvwhu 9bbcj1h9cb "
    "fsi f tswmxmzi zDGrtK ed FBpvrGL vjtqwij ixlmgep 5f8 =lkpqor=qfsb tmowuzs"
)

segments = ciphertext.split()

d = enchant.Dict("en_US")

text = """hacker ethics is a set of principles that guide the behavior of individuals who explore and manipulate computer systems, often emphasizing curiosity, creativity, and the pursuit of knowledge. rooted in values such as openness, free access to information, and the belief in using skills to improve systems rather than harm them, hacker ethics encourages responsible and ethical use of technology. it advocates for transparency, collaboration, and respecting privacy, while discouraging malicious activities like stealing data or causing damage. these principles aim to foster innovation and a positive impact on society through ethical and constructive hacking."""
text = text.replace(".", "").replace(",", "")
wordslist = text.split(" ")
print(wordslist)

shifts = []

for seg_index, seg_text in enumerate(segments):
 
    if not all(c in chars for c in seg_text):
        print(f"Segment {seg_index}: '{seg_text}' skipped (contains non-alphabet characters)")
        print("-" * 60)
        continue

    print(f"Segment {seg_index}: '{seg_text}'")
    for shift in range(len(chars)):
        try:
            candidate = caesar_decrypt(seg_text, shift)
        except ValueError:
            continue
        if candidate and d.check(candidate):
            print(f"  Shift {shift:2d} ({chars[shift]}): {candidate}")
            if candidate.strip() == wordslist[seg_index].strip():
                shifts.append(shift)
    print("-" * 60)

print(shifts)
chars = string.ascii_letters + string.digits + '+/='

flag = ""

for shift in shifts:
    flag += chars[shift]

print(flag.replace("+", "_"))
```