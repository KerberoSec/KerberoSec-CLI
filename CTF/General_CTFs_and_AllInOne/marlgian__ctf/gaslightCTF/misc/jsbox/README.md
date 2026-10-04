<img width="1338" height="545" alt="{C9F19CE7-EC68-4CA6-AD9B-84180E29F5B3}" src="https://github.com/user-attachments/assets/58c7ecee-c9cd-442e-b007-04aa5d357438" />

**So, when I started to open a private instance for the challenge, this what pop ups to my terminal.**
<img width="1099" height="246" alt="{741E7E32-AD71-4A9D-8AD2-AB4FA2D883A1}" src="https://github.com/user-attachments/assets/bf1352bb-c95c-44ba-b537-159e037153ef" />

**First, I tried inputting a string of "yes" and a boolean value because it asks if this is a flag?.**

<img width="783" height="292" alt="{5B906320-007B-4CA4-8744-473A8E50FA38}" src="https://github.com/user-attachments/assets/0db706a2-78c1-47ff-86be-169dfed57584" />
<img width="792" height="287" alt="{C63A77F7-3A78-4CFE-A615-972A5B034D5A}" src="https://github.com/user-attachments/assets/3e72aa02-f89d-4d4b-8474-59900bd4819c" />

**Both just replied the same thing I entered, and nothing happens.**
**Now I just entered anything I can think of, I tried inputting bunch of letter A's.**

<img width="864" height="554" alt="{7AFA2BD7-5A6D-48F4-BFBD-417EB62EE97F}" src="https://github.com/user-attachments/assets/0cfdf599-8e04-4327-b99e-3b93fce85442" />

**Interesting, it said "undefined" and from the error alone I can say that this blackbox runs on JavaScript because of node and jsbox, I can almost think of that it calls a function every time when it is not a string, integer or boolean value...**

**So, I tried to input, console.log because it is the first function I can think of.**

<img width="191" height="62" alt="{60779F7C-A72C-4545-895E-4D5BFFE746FA}" src="https://github.com/user-attachments/assets/5153683e-7bed-407c-94fc-4a50f97606f5" />

**So, it accepted as function, is it intriguing that ```blackbox("is this a flag?")``` this is like a function? should I try inputting this?**

<img width="201" height="62" alt="{62650DED-E251-44FC-9615-45FC6BB9819B}" src="https://github.com/user-attachments/assets/045c76b2-f637-4423-b9b5-5257a94edf95" />

**So, it is a function, what if I try putting something inside the blackbox function? I tried inputting ```blackbox(blackbox)``` as my first input**
<img width="1100" height="335" alt="{DC1C3FC9-737D-4ED3-A97E-24DC13830BEC}" src="https://github.com/user-attachments/assets/2a9942b0-0ede-4ff9-98d1-bcc033646814" />
**So, it said that the flag must be a string... I tried everything here almost spent 1hr for this particular blackbox, it always spews false**
<img width="939" height="60" alt="{A30C601D-2431-4978-9D65-040E9A6564BC}" src="https://github.com/user-attachments/assets/3dc1871f-0a85-44bf-96e8-1400f212ce47" />
**So, I just think, is there any code that can return a function's code? maybe I can get a clue, on how the blackbox function works. So, I search through it and found one.**
**It says that you can use .toString() function to spew out its code.**

<img width="688" height="331" alt="{3574790D-1E27-4BEB-9152-C0C1BE7BBFD0}" src="https://github.com/user-attachments/assets/72812439-62c7-4719-9e84-e3bc9731cde3" />
(credit to StackOverFlow answer)
<img width="1100" height="62" alt="{0285728D-AE2E-4A80-9A31-C8B88494856F}" src="https://github.com/user-attachments/assets/c2b547e2-0368-4d05-bbbe-d901640a16b5" />

**but all I got is nice try, maybe there is something much more safer and doesn't get filter, I know I am near here.**

**I found a method after searching a bit long time on how to call a function code and make it a String**
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString

**particularly this function ```Function.prototype.toString.call("foo");```.**
**Now instead of just calling the "foo" in there, I tried calling the function blackbox**
<img width="1106" height="411" alt="{426B6AA8-7F81-4365-9DF8-18FA5E1D52B6}" src="https://github.com/user-attachments/assets/b9e83231-60d2-4ecb-98c5-bcf0c4b446d9" />

**And there you go! I got the flag here which is:```gaslightCTF{n4t1v3_c0d3_0r_n4t1v3_fl4g?_27f31fa120a2}```**
**kind of ironic because it is really the native code XD**
