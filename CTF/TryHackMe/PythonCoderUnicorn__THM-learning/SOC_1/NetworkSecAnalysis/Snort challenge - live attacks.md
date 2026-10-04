
#Subscribers 
https://tryhackme.com/room/snortchallenges2

The room invites you to a challenge where you will investigate a series of traffic data and stop malicious activity under two different scenarios. Let's start working with Snort to analyze live and captured traffic.  

Before joining this room, we suggest completing the [Snort](https://tryhackme.com/r/room/snort)  room.

## scenario 1 | brute force 

J&Y Enterprise is one of the top coffee retails in the world. They are known as tech-coffee shops and serve millions of coffee lover tech geeks and IT specialists every day.

They are famous for specific coffee recipes for the IT community and unique names for these products. Their top five recipe names are:

- WannaWhite
- ZeroSleep
- MacDown
- BerryKeep
- CryptoY

J&Y's latest recipe, "**Shot4J**", attracted great attention at the global coffee festival. J&Y officials promised that the product will hit the stores in the coming months.
The super-secret of this recipe is hidden in a digital safe. Attackers are after this recipe, and J&Y enterprises are having difficulties protecting their digital assets.
Last week, they received multiple attacks and decided to work with you to help them improve their security level and protect their recipe secrets.

start Snort in sniffer mode and try to figure out the attack source, service and port.
Then, write an IPS rule and run Snort in IPS mode to stop the brute-force attack. Once you stop the attack properly, you will have the flag on the desktop!

- Create the rule and test it with "-A console" mode. 
- Use **"-A full"** mode and the **default log path** to stop the attack.
- Write the correct rule and run the Snort in IPS "-A full" mode.
- Block the traffic at least for a minute and then the flag file will appear on your desktop.

```
# step 1 - let it run for a few seconds
sudo snort -v -l .

# step 2 - read log
sudo snort -v -r snort.log.<tab>

sudo snort -r snort.log.1741467012 -X -n20
10.10.245.36:46658 -> 10.10.140.29:22

# step 3 - create rule
sudo nano /etc/snort/rules/local.rules

drop tcp any 22 <> any any (msg: "SSH Blocked"; sid: 100001; rev:1;)

# step 4 - run snort

sudo snort -c /etc/snort/rules/local.rules -q -Q --daq afpacket -i eth0:eth1 -A full 

>>> sudo snort -c /etc/snort/snort.conf -q -Q --daq afpacket -i eth0:eth1 -A full

THM{81b7fef657f8aaa6e4e200d616738254}

```

- https://medium.com/@haircutfish/snort-challenge-live-attacks-room-f65858077692
- 

```
Stop the attack and get the flag (which will appear on your Desktop)

THM{81b7fef657f8aaa6e4e200d616738254}

What is the name of the service under attack?

ssh

What is the used protocol/port in the attack?

TCP/22
```

## scenario 2 | reverse shell

```
sudo snort -v -l .
sudo snort -r snort.log.<tab> -X

10.10.196.55:54306 -> 10.10.144.156:4444
10.10.144.156:4444 -> 10.10.196.55:54306

sudo snort -r snort.log.1741472617 -X | grep ":4444"

sudo nano /etc/snort/rules/local.rules

drop tcp any 4444 <> any any (msg:"Reverse Shell Detected"; sid:100001; rev:1;)

sudo snort -c /etc/snort/snort.conf -q -Q --daq afpacket -i eth0:eth1 -A full

Stop the attack and get the flag (which will appear on your Desktop)

THM{0ead8c494861079b1b74ec2380d2cd24}

What is the used protocol/port in the attack?

tcp/4444

Which tool is highly associated with this specific port number?

metasploit

```

