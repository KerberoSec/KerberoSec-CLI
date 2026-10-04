---
title: "TryHackMe: Firewall Fundamentals"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn about firewalls and get hands-on with Windows and Linux built-in firewalls."
---

## Answers

Which security solution inspects the incoming and outgoing traffic of a device or a network?

**Firewall**

Which type of firewall maintains the state of connections?

**Stateful Firewall**

Which type of firewall offers heuristic analysis for the traffic?

**Next-Generation Firewall**

Which type of firewall inspects the traffic coming to an application?

**Proxy Firewall**

Which type of action should be defined in a rule to permit any traffic?

**Allow**

What is the direction of the rule that is created for the traffic leaving our network?

**Outbound**

What is the name of the rule that was created to block all incoming traffic on the SSH port?

**Core Op**

A rule was created to allow SSH from one single IP address. What is the rule name?

**Infra Team**

Which IP address is allowed under this rule?

**192.168.13.7**

Which Linux firewall utility is considered to be the successor of "iptables"?

**nftables**

What rule would you issue with ufw to deny all outgoing traffic from your machine as a default policy? (answer without sudo)

**ufw default deny outgoing**

## Things You Should Know

A Firewall filters incoming and outgoing traffic on a device. It simply acts as a security guard, making sure that unwanted data/traffic is blocked from entering or leaving your network, system, or device. Many modern Firewalls offer extra protection beyond filtering.

### Types of Firewalls
**Stateless Firewall**
- This is the simplest firewall with basic filtering, no tracking of previous connections, data tracking based on predetermined rules, and efficiency on high-speed networks. It operates on layer 3 and 4 of the OSI model.

**Stateful Firewall**
- This Firewall is a bit smarter. It recognizes traffic by patterns, applies complex rules, monitors network connections, and stores data such as previous connections. It operates on layer 3 and 4 of the OSI model.
  
**Proxy Firewall**
- Proxy Firewalls can inspect the data inside the packets, provide content filtering options, provide application control, and decrypt and inspect SSL/TLS data packets in addition to all of the previous Firewall's functions. It operates on layer 7 of the OSI model.
  
**Next-Generation Firewall (NGFW)**
- Next-Generation Firewalls are the most advanced firewalls. They provide advanced threat protection, come with an intrusion prevention system, identify anomalies based on heuristic analysis, and decrypt and inspect SLL/TLS data packets. It operates on layers 3-7 of the OSI model.

### Basic Components of a Firewalls Rule

**Source Address:** IP address that originates traffic

**Destination Address:** IP address that recieves data/traffic

**Port:** Port number Traffic is recieved/sent through

**Protocol:** The protocol that would be used during the communication

**Action:** What action does the rule take after identifying any traffic of a certain nature?

**Direction:** Will this rule be applied to incoming or outgoing traffic?

### Types of Actions

**Allow:** When Allow is placed in a rule, the rule will permit certain incoming or outgoing traffic.

**Deny:** When Deny is placed in a rule, the rule will block certain incoming or outgoing traffic.

**Forward:** When Forward is placed in a rule, the rule will redirect traffic to a different network segment.

### Directions of Rules

**Inbound Rules:** An inbound rule will apply to incoming traffic. For example, You can allow incoming HTTP traffic from Port 80 on your web server

**Outbound Rules:** An Outbound rule will apply to outgoing traffic. For example, you can block all outgoing SMTP traffic on port 25 from all devices except the mail server

**Forward Rules:** A Forward rule will move specific traffic inside a network. For example, you can forward incoming HTTP traffic on port 80 to the web server on your network.

### Linux iptables Firewall

**Netfilter**

Netfilter is the framework inside Linux OS with core firewall functions. There are various firewall utilities that use Netfilter as a foundation to control network traffic. Some examples are:
- **iptables:** The most widely used utility in many Linux distributions that uses Netfilter framework to give a variety of functions to control network traffic.
- **nftables:** The successor to iptables with enhanced packet filtering and NAT capabilities.
- **firewalld:** This utility has predefined rules and works differently than the other utilities since it comes with different pre-built network zone configurations.

**ufw (Uncomplicated Firewall)**
ufw is a firewall with the Netfilter framework on Linux that eliminates the complicated syntax it takes to make rules on iptables and nftables. It gives users an easier, beginner-friendly interface.
