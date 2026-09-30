# Description

Lyrics jump from verses to the refrain kind of like a subroutine call. There's a hidden refrain this program doesn't print by default. Can you get it to print it? There might be something in it for you.
The program's source code can be downloaded here.
Connect to the program with netcat:
`$ nc verbal-sleep.picoctf.net 56688`

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/9f2b86c1e1068d492f783b106f4535aeb137b0c0e31e43351f8cb82a39456a84/lyric-reader.py`

After downloading the source code these are the important parts to look at:

```
secret_intro = \
'''Pico warriors rising, puzzles laid bare,
Solving each challenge with precision and flair.
With unity and skill, flags we deliver,
The ether’s ours to conquer, '''\
+ flag + '\n'

song_flag_hunters = secret_intro +\
'''
```

From this section, you can see that there is a secret intro variable that has the flag attached to it and song_flag_hunters has it added to the very start before anything. 

```
def reader(song, startLabel):
  lip = 0
  start = 0
  refrain = 0
  refrain_return = 0
  finished = False

  # Get list of lyric lines
  song_lines = song.splitlines()
  
  # Find startLabel, refrain and refrain return
  for i in range(0, len(song_lines)):
    if song_lines[i] == startLabel:
      start = i + 1
    elif song_lines[i] == '[REFRAIN]':
      refrain = i + 1
    elif song_lines[i] == 'RETURN':
      refrain_return = i

  # Print lyrics
  line_count = 0
  lip = start
  while not finished and line_count < MAX_LINES:
    line_count += 1
    for line in song_lines[lip].split(';'):
      if line == '' and song_lines[lip] != '':
        continue
      if line == 'REFRAIN':
        song_lines[refrain_return] = 'RETURN ' + str(lip + 1)
        lip = refrain
      elif re.match(r"CROWD.*", line):
        crowd = input('Crowd: ')
        song_lines[lip] = 'Crowd: ' + crowd
        lip += 1
      elif re.match(r"RETURN [0-9]+", line):
        lip = int(line.split()[1])
      elif line == 'END':
        finished = True
      else:
        print(line, flush=True)
        time.sleep(0.5)
        lip += 1

reader(song_flag_hunters, '[VERSE1]')
```

The reader function has two parameters `song, startLabel` which at the end can be seen to be song_flag_hunters which was declared before and the startLabel is set to `'[VERSE1]'` which is after the secret_intro.

The next important thing to consider is `for line in song_lines[lip].split(';')` which is in the while loop. You can consider the lip variable as the current line that is being processed through the loop and then checked with many different if statements to determine the correct action. For instance when it gets to `REFRAIN;` then it changes the lip variable to refrain to do those lines. One of the lines near the start says `CROWD (Singalong here!);` which activates the `elif re.match(r"CROWD.*", line):` statement which lets the user put an input. That input will be taken into the for loop that takes in the line.

Let's say for instance you wanted to end the program and when it gets to `Crowd: ` to put an input you put in `END` with the thought that during the next iteration of Crowd triggering it would end the program it wouldn't actually do that. That is because this is the statement, `elif line == 'END':`, which needs it to end exactly END whereas it is taking in  `Crowd: END` as the line that is being processed. In the for loop it splits based on semicolons so whenever you run it put in something like `;END` and in the next iteration it would end.

Similarly, you can use RETURN with the value of 0 to get to the secret_intro that holds the flag with this `;RETURN 0`. Once you wait for the next verse that calls Crowd it will execute `Crowd: ` and `RETURN 0` where the second part will output the secret intro and then at the end of that intro you will see the flag. It doesn't really matter what you put in front of the semicolon so it could even be `nsaidnsaiodnas;2132131isaodnsoiadioas;niohiwoeuwoqie;RETURN 0;hsaod980123;z` as long as one of them contain `RETURN 0` that will only be executed as that then it will output the flag.

Flag: `picoCTF{70637h3r_f0r3v3r_750...}`
