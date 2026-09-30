<h1 align="center">Classic Passwd</h1>
<p align="center"><img width="80px" src="https://github.com/user-attachments/assets/8b7b3986-9a26-40dc-95de-8adb373b7f0c"><br>
2025, September 6<br> Hey there, fellow lifelong learner! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>,<br>
and I’m excited to join you on this adventure, part of my <code>488</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>
<em>Practice your skills in reversing and get the flag bypassing the login</em>.<br>
Access it <a href="https://tryhackme.com/room/classicpasswd"</a>here.<br>
<img width="1200px" src="https://github.com/user-attachments/assets/5310755f-3c9c-4ace-971b-c87f6e26034e"></p>

<h2>Task 1 . Get Connected</h2>
<p>I forgot my password, can you give me access to the program?</p>

<p><em>Answer the question below</em></p>

```bash
$ mv 'Challenge_1609966715991 (1).Challenge'  challenge
cyberlaser@DESKTOP-0AHBUE8:/mnt/c/Users/Rosana/TryHackMe$ chmod +x challenge
cyberlaser@DESKTOP-0AHBUE8:/mnt/c/Users/Rosana/TryHackMe$ ./challenge
Insert your username: e

Authentication Error
```

```bash
$ ltrace ./challenge
printf("Insert your username: ")                                          = 22
__isoc99_scanf(0x57df6b64101b, 0x7ffdc8d93110, 0, 0Insert your username: t
)                      = 1
strcpy(0x7ffdc8d93080, "t")                                               = 0x7ffdc8d93080
strcmp("t", "xxxxxxxxxxxxx")                                              = 51
puts("\nAuthentication Error"
Authentication Error
)                                            = 22
exit(0 <no return ...>
+++ exited (status 0) +++
```

```bash
$ ./challenge
Insert your username: xxxxxxxxxxxxx

Welcome
THM{***********}
```

<br>
<p>1.1. What is the flag?<br>
<code>THM{***********}</code></p>

<br>
<br>
<br>

<br>
<h2 align="center">Completed</h2>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/439b3da2-90b6-4879-9682-0b2283d5f38f"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/f32275ed-e3d9-48a9-b32b-b122c059342a"></p>

<h2 align="center">My TryHackMe Journey</h2>

<div align="center">

| Date              | Room                                  |Streak   |   All Time   |   All Time   |   Monthly   |   Monthly  | Points   | Rooms     | Badges    |
|:------------------|:--------------------------------------|--------:|:-----------: | :----------: | :---------: | :--------: | :------  | :-------: | :-------: |
|                   |                                       |         |    Global    |    Brazil    |   Global    |   Brazil   |          | Completed |           |
| 2025, Sep 6       |Easy 🚩: <code>Classic Passwd</code> | 488     |     114ᵗʰ    |      5ᵗʰ     |     683ᵗʰ   |    12ⁿᵈ    | 124,476  |    947    |    73     |
| 2025, Sep 6       |Medium 🚩: toc2                      | 488     |     114ᵗʰ    |      5ᵗʰ     |     695ᵗʰ   |    12ⁿᵈ    | 124,446  |    946    |    73     |
| 2025, Sep 6       |Hard 🚩: Extract                      | 488     |     114ᵗʰ    |      5ᵗʰ     |     716ᵗʰ   |    13ʳᵈ    | 124,386  |    945    |    73     |
| 2025, Sep 6       |Medium 🚩: Plotted-EMR                | 488     |     114ᵗʰ    |      5ᵗʰ     |     844ᵗʰ   |    12ⁿᵈ    | 124,326  |    944    |    73     |
| 2025, Sep 5       |Medium 🚩: Inferno                    | 487     |     114ᵗʰ    |      5ᵗʰ     |     758ᵗʰ   |    12ⁿᵈ    | 124,236  |    943    |    73     |
| 2025, Sep 5       |Easy 🔗: Psycho Break                 | 487     |     115ᵗʰ    |      5ᵗʰ     |     724ᵗʰ   |    10ᵗʰ    | 124,152  |    942    |    73     |
| 2025, Sep 4       |Medium 🔗: IP and Domain Threat Intel | 486     |	   113ʳᵈ   |	     5ᵗʰ   	|      579ᵗʰ   |	  10ᵗʰ    |	124,018  |	  940	   |    73     |
| 2025, Sep 4       |Medium 🚩: Cold VVars                 | 486     |     113ʳᵈ    |      5ᵗʰ     |     579ᵗʰ   |    10ᵗʰ    | 124,048  |    941    |    73     |
| 2025, Sep 3       |Easy 🔗: Malware Classification       | 485     |     112ⁿᵈ    |      5ᵗʰ     |     714ᵗʰ   |    13ʳᵈ    | 123,882  |    939    |    73     |
| 2025, Sep 2       |Medium 🔗: Session Forencics          | 484     |     111ˢᵗ    |      5ᵗʰ     |     706ᵗʰ   |    14ᵗʰ    | 123,786  |    938    |    73     |
| 2025, Sep 1       |Medium 🚩: Voyage                     | 483     |     111ˢᵗ    |      5ᵗʰ     |     849ᵗʰ   |    15ᵗʰ    | 123,636  |    937    |    73     |

</div>

<br>

<p align="center">Global All Time:   114ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/78dec1e9-6e35-44df-bf5f-147923121f43"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/d3cd2a00-621e-47be-ac04-8f93de00bd81"><br><br>
                  Brazil All Time:     5ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/87ddf1c2-847e-4e63-8407-1f7955272b40"><br>
                  Global monthly:    683ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/5a5d189a-6fb8-4b64-b4b2-f40a476d22f7"><br>
                  Brazil monthly:     12ⁿᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/10432dad-2839-4851-983e-c6bb6f9baa63"><br>

<h2 align="center">Thanks for coming!</h2>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
